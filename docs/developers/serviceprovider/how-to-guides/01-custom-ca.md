---
sidebar_position: 1
---

# Implement Custom CA Support

Use this guide when the domain service managed by your service provider needs to trust custom Certificate Authorities — for example, to connect to APIs of a private cloud platform, a database server, or any HTTPS endpoint whose certificate is signed by a non-public CA.

This guide covers the developer side. For the operator side (creating the CA bundle ConfigMaps and referencing them in a deployed `ProviderConfig`) see [Configure Custom CAs](../../../operators/how-to-guides/01-custom-ca.md).

## Prerequisites

- A service provider created from the [service-provider-template](https://github.com/openmcp-project/service-provider-template)
- Familiarity with the [ProviderConfig design guidelines](../02-service-providers.mdx#edit-the-providerconfig-api)

## Step 1 — Add `caBundleRef` to your ProviderConfig API

Open your `ProviderConfig` type definition (typically `api/v1alpha1/providerconfig_types.go`) and add a `CaBundleRef` field to the spec:

```go title="api/v1alpha1/providerconfig_types.go"
import corev1 "k8s.io/api/core/v1"

type ProviderConfigSpec struct {
    // ... existing fields ...

    // CABundleRef is a reference to a config map containing certificate bundle.
    // It will be installed on the ManagedControlPlane and configured for the domain service.
    // +kubebuilder:validation:Optional
    CaBundleRef *corev1.ConfigMapKeySelector `json:"caBundleRef,omitempty"`
}
```

`corev1.ConfigMapKeySelector` is the idiomatic Kubernetes type for a `{name, key}` reference to a ConfigMap entry. It produces the YAML structure that operators set in their `ProviderConfig`:

```yaml
spec:
  caBundleRef:
    name: ca-bundles
    key: full-bundle.crt
```

After editing the type, run code generation to update the deepcopy and CRD manifest:

```bash
task generate
task manifests
```

## Step 2 — Resolve the bundle in `CreateOrUpdate`

The CA bundle ConfigMap lives on the **platform cluster** in the `openmcp-system` namespace. You can read it at the start of your `CreateOrUpdate` method using the platform cluster client:

```go title="internal/controller/fooservice_controller.go"
func (r *FooServiceReconciler) CreateOrUpdate(
    ctx context.Context,
    obj *apiv1alpha1.FooService,
    pc *apiv1alpha1.ProviderConfig,
    clusters spruntime.ClusterContext,
) (ctrl.Result, error) {
    var caBundle []byte
    if pc.Spec.CaBundleRef != nil {
        cm := &corev1.ConfigMap{}
        key := client.ObjectKey{
            Namespace: r.PodNamespace, // openmcp-system
            Name:      pc.Spec.CaBundleRef.Name,
        }
        if err := r.PlatformCluster.Client().Get(ctx, key, cm); err != nil {
            return ctrl.Result{}, fmt.Errorf("fetching CA bundle ConfigMap %q: %w", key.Name, err)
        }
        bundle, ok := cm.Data[pc.Spec.CaBundleRef.Key]
        if !ok {
            return ctrl.Result{}, fmt.Errorf("CA bundle ConfigMap %q has no key %q", key.Name, pc.Spec.CaBundleRef.Key)
        }
        caBundle = []byte(bundle)
    }

    // pass caBundle into your client/deployment logic below
    _ = caBundle
    return ctrl.Result{}, nil
}
```

`r.PodNamespace` is the namespace the service provider pod runs in — the same namespace where operators place the CA bundle ConfigMaps. Ensure this field is populated in your reconciler struct:

```go title="internal/controller/fooservice_controller.go"
type FooServiceReconciler struct {
    OnboardingCluster *clusters.Cluster
    PlatformCluster   *clusters.Cluster
    PodNamespace      string
}
```

And pass it when constructing the reconciler in `main.go`:

```go title="cmd/main.go"
controller.FooServiceReconciler{
    PodNamespace: os.Getenv("POD_NAMESPACE"),
    // ...
}
```

## Step 3 — Make use of the bundle

:::info Which bundle key to use
- Point `caBundleRef.key` at `full-bundle.crt` (custom + public CAs) when you **replace** `x509.SystemCertPool()` or construct an empty pool — otherwise well-known public CA certificates are lost.
- Point `caBundleRef.key` at `ca-bundle.crt` (custom CAs only) when you **append** to `x509.SystemCertPool()` as shown above, because the system pool already contains the public CAs.

Add this decision to your service provider's documentation, e.g. in the README. This helps operator to configure the right certificate bundle for your service provider.
:::

### 3a. Outbound connections from the controller process

If your controller makes direct HTTPS calls — for example, to a Helm repository, an OCI registry, or an external API — build a `*x509.CertPool` from the bundle and use it in your `http.Client`:

```go
import (
    "crypto/tls"
    "crypto/x509"
    "net/http"
)

func httpClientWithCA(caBundle []byte) *http.Client {
    pool, err := x509.SystemCertPool()
    if err != nil {
        pool = x509.NewCertPool()
    }
    pool.AppendCertsFromPEM(caBundle)
    return &http.Client{
        Transport: &http.Transport{
            TLSClientConfig: &tls.Config{RootCAs: pool},
        },
    }
}
```

Pass this client to any HTTP-based library that accepts a custom `http.Client` (for example, most Helm and OCI client constructors accept one).

### 3b. Workloads deployed into MCPs or workload clusters

If your service provider installs workloads (Deployments, Helm releases) that themselves need to trust the custom CA, the CA bundle must be available inside the target cluster. Copy the bundle as a ConfigMap into the workload namespace, then mount it into any Pod you manage.

**Copy the ConfigMap** at reconcile time:

```go
func (r *FooServiceReconciler) syncCABundle(
    ctx context.Context,
    pc *apiv1alpha1.ProviderConfig,
    caBundle []byte,
    targetClient client.Client,
    targetNamespace string,
) error {
    if caBundle == nil {
        return nil
    }
    cm := &corev1.ConfigMap{
        ObjectMeta: metav1.ObjectMeta{
            Name:      "ca-bundle",
            Namespace: targetNamespace,
        },
    }
    _, err := ctrl.CreateOrUpdate(ctx, targetClient, cm, func() error {
        cm.Data = map[string]string{
            pc.Spec.CaBundleRef.Key: string(caBundle),
        }
        return nil
    })
    return err
}
```

Call this helper early in `CreateOrUpdate`, before reconciling any workloads:

```go
workloadClient := clusters.WorkloadCluster.Client() // or clusters.MCPCluster.Client()
if err := r.syncCABundle(ctx, pc, caBundle, workloadClient, targetNamespace); err != nil {
    return ctrl.Result{}, err
}
```

**Mount the ConfigMap** in any Pod spec you manage:

```go
pod.Spec.Volumes = append(pod.Spec.Volumes, corev1.Volume{
    Name: "ca-bundle",
    VolumeSource: corev1.VolumeSource{
        ConfigMap: &corev1.ConfigMapVolumeSource{
            LocalObjectReference: corev1.LocalObjectReference{Name: "ca-bundle"},
        },
    },
})
pod.Spec.Containers[0].VolumeMounts = append(pod.Spec.Containers[0].VolumeMounts, corev1.VolumeMount{
    Name:      "ca-bundle",
    MountPath: "/etc/ssl/custom",
    ReadOnly:  true,
})
```

If you deploy via Helm, pass the bundle content as a chart value instead and let the chart handle the ConfigMap and volume mount.

## Step 4 — Re-enqueue on ConfigMap changes

TODO

## Verification

1. Create a `ProviderConfig` with a `caBundleRef` pointing to a ConfigMap that contains a self-signed CA certificate.
2. Verify your controller reads the ConfigMap without errors (check the controller logs).
3. Confirm that outbound HTTPS connections to a service signed by that CA succeed.
4. Update the ConfigMap content and confirm the controller reconciles all `FooService` objects automatically.
5. Remove `caBundleRef` from the `ProviderConfig` and confirm the controller falls back to default TLS behavior.
