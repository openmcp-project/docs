---
sidebar_position: 2
id: controlplane-token
---

# Provide a ControlPlane Token to the Workload Cluster

Use this guide when your domain service runs on the workload cluster but needs access to the tenant `ControlPlane`, for example a controller that watches CRs on the `ControlPlane`. The service provider creates a ServiceAccount on the `ControlPlane` and stores a token for it in a Secret on the workload cluster.

ServiceAccount tokens expire, so the token must be renewed. You don't need to handle the token refresh in your Service Provider. Especially since the runtime reconciles a ready object only about every 30 minutes (see [Requeue Behavior](../develop#requeue-behavior)), which is not tied to the lifetime of the token. Use the token refresh controller from [`extensibility-utils/pkg/tokenrefresh`](https://github.com/openmcp-project/extensibility-utils#pkgtokenrefresh) instead. It runs next to your main controller and renews each token at 80% of its validity.

The token creation/refresh process is split between the two controllers:

- Your main reconciler creates the ServiceAccount and the Secret, and mints the first token.
- The token refresh controller renews the token in the existing Secret. It only writes the `token`, `ca.crt` and `namespace` keys and two annotations. It doesn't create or delete anything.

## Prerequisites

- A service provider created from the [service-provider-template](https://github.com/openmcp-project/service-provider-template) that uses a workload cluster
- `github.com/openmcp-project/extensibility-utils` v0.4.0 or later in your `go.mod`

## Step 1 — Mint the first token in your main reconciler

Create the Secret on the workload cluster in `CreateOrUpdate` and call `tokenrefresh.EnsureToken` while the Secret has no token yet. `EnsureToken` requests a token for the ServiceAccount on the `ControlPlane` and writes it, the CA bundle, the namespace and the annotations into the Secret in memory. Persist the Secret afterwards as usual.

```go
binding := tokenrefresh.Binding{
 ServiceAccount: types.NamespacedName{Name: "foo-controller", Namespace: "foo-system"}, // on the ControlPlane
 Secret:         types.NamespacedName{Name: "foo-controlplane-token", Namespace: workloadNamespace},
}

// inside the mutate function of the Secret
if len(secret.Data[tokenrefresh.SecretKeyToken]) > 0 {
 // leave an existing token alone, the token refresh controller renews it
 return nil
}
_, err := tokenrefresh.EnsureToken(ctx, clusters.MCPCluster, secret, binding, "foo", tokenrefresh.DefaultTokenLifetime)
return err
```

The fourth argument is the service provider name. It's used to build the annotation keys `foo.services.open-control-plane.io/token-creation-time` and `.../token-expiration-time`, so it must be the same value as `ServiceProviderName` in step 2.

Minting the first token here means a pod that mounts the Secret as a required volume never sees it empty.

## Step 2 — Register the token refresh controller

In `main.go`, register a `tokenrefresh.Reconciler` for your service API type next to the `APIReconciler`:

```go
tokenRefresher := &tokenrefresh.Reconciler[*apiv1alpha1.FooService]{
 Client:              mgr.GetClient(),
 ServiceProviderName: "foo",
 NewObject:           func() *apiv1alpha1.FooService { return &apiv1alpha1.FooService{} },
 // read-only, the AccessRequests are owned by the APIReconciler
 Clusters: func(ctx context.Context, req reconcile.Request) (*clusters.Cluster, *clusters.Cluster, error) {
  mcp, err := clusterAccessReconciler.MCPCluster(ctx, req)
  if err != nil {
   return nil, nil, err
  }
  workload, err := clusterAccessReconciler.WorkloadCluster(ctx, req)
  if err != nil {
   return nil, nil, err
  }
  return mcp, workload, nil
 },
 Binding: func(ctx context.Context, obj *apiv1alpha1.FooService) (tokenrefresh.Binding, bool, error) {
  // the workload namespace is known once the main controller has assigned the instance ID
  if instance.GetID(obj) == "" {
   return tokenrefresh.Binding{}, false, nil
  }
  return fooBinding(instance.Namespace(obj)), true, nil
 },
}
if err := tokenRefresher.SetupWithManager(mgr, "foo-token-refresh"); err != nil {
 setupLog.Error(err, "unable to create controller", "controller", "FooTokenRefresh")
 os.Exit(1)
}
```

- `Clusters` resolves the `ControlPlane` and workload cluster of an object. Use the same cluster access reconciler as the `APIReconciler`, but only read from it.
- `Binding` returns the ServiceAccount and the Secret of an object. Return `false` while they are not known yet; the controller retries after 10 seconds. Return an error if resolving them fails, for example when you read the `ProviderConfig` to find the namespace; controller-runtime then retries with backoff.
- `Binding` must return the same pair you passed to `EnsureToken` in step 1. Share one function between both places.

## Step 3 — Consume the token

The Secret always holds a valid token under the `token` key and the `ControlPlane` CA bundle under `ca.crt`. How the domain service reads it depends on the service:

- **The service reads the token directly**, for example from a mounted file or a Secret reference in its own configuration. Nothing else is needed. Kubernetes updates mounted Secret files when the Secret changes, unless they are mounted with `subPath`.
- **The service needs a kubeconfig.** Continue with the next section.

### Use a static kubeconfig

Don't put the token into the kubeconfig: the token refresh controller doesn't update it, and the kubeconfig would go stale after the first renewal. Store a static kubeconfig in the same Secret that references the `token` and `ca.crt` keys as files. client-go resolves relative paths against the directory of the kubeconfig file and reads the token file again when it changes, so the service keeps its access without a restart.

Write the kubeconfig in the mutate function of the Secret from step 1, before the early return. Otherwise Secrets that already hold a token, for example after an upgrade of your service provider, never get a kubeconfig. The kubeconfig contains no credentials and doesn't change, so writing it on every reconcile is a no-op.

```go
// inside the mutate function of the Secret, before the early return of step 1
kubeconfig, err := clientcmd.Write(clientcmdapi.Config{
 Clusters: map[string]*clientcmdapi.Cluster{
  "controlplane": {
   Server:               clusters.MCPCluster.RESTConfig().Host,
   CertificateAuthority: tokenrefresh.SecretKeyCA, // ca.crt next to the kubeconfig
  },
 },
 AuthInfos: map[string]*clientcmdapi.AuthInfo{
  "foo": {TokenFile: tokenrefresh.SecretKeyToken}, // token next to the kubeconfig
 },
 Contexts: map[string]*clientcmdapi.Context{
  "controlplane": {Cluster: "controlplane", AuthInfo: "foo"},
 },
 CurrentContext: "controlplane",
})
if err != nil {
 return err
}
if secret.Data == nil {
 secret.Data = map[string][]byte{}
}
secret.Data["kubeconfig"] = kubeconfig
```

`clientcmd` and `clientcmdapi` are `k8s.io/client-go/tools/clientcmd` and `k8s.io/client-go/tools/clientcmd/api`. Use the `tokenrefresh` constants for the file names, so they always match the keys the token refresh controller writes.

Mount the whole Secret into one directory and point `KUBECONFIG` to the file:

```yaml
containers:
  - name: foo-controller
    env:
      - name: KUBECONFIG
        value: /var/run/secrets/open-control-plane.io/controlplane/kubeconfig
    volumeMounts:
      - name: controlplane-token
        mountPath: /var/run/secrets/open-control-plane.io/controlplane
        readOnly: true
volumes:
  - name: controlplane-token
    secret:
      secretName: foo-controlplane-token
```

Don't mount the kubeconfig with `subPath` or select only the `kubeconfig` key with `items`. In both cases `token` and `ca.crt` are missing next to the kubeconfig, and the service fails only at run time. With `subPath`, Kubernetes also doesn't update the file when the Secret changes.

The static kubeconfig only works for consumers that read it from a file. A consumer that reads the kubeconfig directly from the Secret, for example a Flux `HelmRelease` with `spec.kubeConfig.secretRef`, has no directory to resolve `token` and `ca.crt` against.

## Examples

- [service-provider-velero](https://github.com/openmcp-project/service-provider-velero/blob/main/cmd/service-provider-velero/main.go): `Binding` from the instance namespace only.
- [service-provider-metrics-operator](https://github.com/openmcp-project/service-provider-metrics-operator/blob/main/internal/controller/metricsoperator_controller.go): `Binding` that reads the `ProviderConfig` to find the namespace of the ServiceAccount.
