# Cluster Providers

A *ClusterProvider* is one of the three provider types in the openMCP architecture (the other two being *PlatformService* and *ServiceProvider*). ClusterProviders are responsible for managing kubernetes clusters and access to them, based on our [cluster API](https://github.com/openmcp-project/openmcp-operator/tree/main/api/clusters/v1alpha1).

This document aims to describe the tasks of a ClusterProvider and the contract that it needs to fulfill in order to work within the openMCP ecosystem.

## Deploying a ClusterProvider

ClusterProviders are usually deployed via the [provider deployment](./provider_deployment.md) mechanism and need to stick to the corresponding contract.

## Implementing a ClusterProvider

### Provider Configuration

Most ClusterProviders will probably require some form of configuration. Since the provider deployment does not allow passing in configuration via an argument to the binary directly, they need to read the configuration from a k8s resource. Depending on the provider, it might even allow multiple configuration resources and/or reconcile them instead of just reading them statically.

### Cluster Profiles

Out of the configuration(s), the ClusterProvider has to generate `ClusterProfile` resources. They serve as some kind of service discovery and look like this:
```yaml
apiVersion: clusters.openmcp.cloud/v1alpha1
kind: ClusterProfile
metadata:
  name: default.gardener.mcpd-gcp-large
spec:
  providerConfigRef:
    name: mcpd-gcp-large
  providerRef:
    name: gardener
  supportedVersions:
  - version: 1.33.3
  - deprecated: true
    version: 1.33.2
  - version: 1.32.7
  - deprecated: true
    version: 1.32.6
  - deprecated: true
    version: 1.32.5
  - deprecated: true
    version: 1.32.4
  - deprecated: true
    version: 1.32.3
  - deprecated: true
    version: 1.32.2
```

`spec.providerRef` is the name of the ClusterProvider that created this `ClusterProfile`. It should be filled with the value that the provider received via its [`--provider-name`](./provider_deployment.md#arguments) argument.

`spec.providerConfigRef` is the name of the provider configuration that is responsible for this profile. Whether this refers to an actual k8s resource, an internal value or just a static string depends on the provider implementation. It is used as a label value though and therefore has to match the corresponding regex.

`spec.supportedVersions` is a list of kubernetes versions that are supported by this provider for this profile.

> The name of the ClusterProfile can be freely chosen. In this example, it follows the format `X.Y.Z`, where `X` is the environment name, `Y` is the name of the ClusterProvider, and `Z` is the name of the provider configuration that created this profile. A naming scheme like this avoids potential conflicts between multiple ClusterProviders (or multiple instances of the same ClusterProvider).

`ClusterProfile` resources are cluster-scoped and do not have a status.

Note that each ClusterProvider must at least generate one `ClusterProfile` in order to be usable.

### Cluster Management

The main purpose of ClusterProviders is the management of k8s clusters. Each ClusterProvider therefore needs a controller that reconciles the `Cluster` resource, which looks like this:
```yaml
apiVersion: clusters.openmcp.cloud/v1alpha1
kind: Cluster
metadata:
  annotations:
    clusters.openmcp.cloud/providerinfo: foobar
  labels:
    clusters.openmcp.cloud/k8sversion: 1.31.11
    clusters.openmcp.cloud/provider: gardener
  name: my-cluster
  namespace: my-namespace
spec:
  kubernetes:
    version: 1.32.8
  profile: default.myprovider.myprofile
  purposes:
  - my-purpose
  tenancy: Shared
```

Some information about the different fields:
- The `clusters.openmcp.cloud/k8sversion` and `clusters.openmcp.cloud/provider` labels are not set by default. The cluster provider can populate them to allow for easier filtering or better column information in `kubectl get`.
  - Note that `spec.kubernetes.version` contains a desired k8s version, which does not have to match the actual k8s version that is displayed in the label.
- The `clusters.openmcp.cloud/providerinfo` annotation can be used to hold additional provider-specific information. It is displayed as a column on `kubectl get -o wide`.
- `spec.kubernetes.version` can contain a desired k8s version. If not set, the provider has to derive it from its configuration. The provider can decide to either throw an error or choose a version if an invalid/unsupported version is specified.
- `spec.profile` is the most important field for a ClusterProvider. It references the `ClusterProfile` that should be used for this cluster.
  - The referenced profile contains a reference to the ClusterProvider it belongs to. Since multiple ClusterProviders can run in parallel, this allows a ClusterProvider to determine whether it is responsible for this cluster resource or not.
    - **ClusterProviders must only ever act on `Cluster` resources that reference profiles belonging to themselves!**
    - The profile is immutable.
  - This can also contain further configuration, e.g. for the Gardener ClusterProvider, each provider configuration (which is referenced in the profile) can specify a different Gardener landscape and/or project to use.
- `spec.purposes` and `spec.tenancy` are mostly relevant for the scheduler and usually don't need to be evaluated by the ClusterProvider.

#### Reconciliation Logic

Before doing anything in a reconciliation, the ClusterProvider needs to check whether it is responsible for the `Cluster` resource or not. For this, it has to check if it created the `ClusterProfile` that is referenced in `spec.profile` itself or if it was created by a different ClusterProvider. It can either keep track of created `ClusterProfile` resources internally or compare `spec.providerRef.name` in the profile to its own name (passed in via the `--provider-name` argument). If the name differs, another ClusterProvider is responsible for this resource and the ClusterProvider must not touch it.

The rest of the reconciliation logic is pretty much provider specific: If the `Cluster` resource has a deletion timestamp, delete the k8s cluster and everything that belongs to it and then remove the finalizer. Otherwise, ensure that there is a finalizer on the `Cluster` resource and create/update the actual k8s cluster.

#### Status Reporting

Since creating, updating, or deleting k8s clusters can easily take several minutes, reporting the current status is very important here. It is recommended to make good use of the conditions that are part of the status. ClusterProviders must adhere to the [general status reporting rules](./general.md#status-reporting).

In addition to the common status, the `Cluster` status contains a few more fields that can be set by the ClusterProvider:
- `apiServer` should be filled with the k8s cluster's apiserver endpoint, as soon as it is known.
- `providerStatus` can hold arbitrary data and is meant for provider-specific information. Using it is optional and no other controller will evaluate the contents of this field.

Note that any kind of kubeconfig should not be part of the cluster's status - access to the cluster is managed via `AccessRequest` resources.

### Access Management

ClusterProviders are not only responsible for creating and deleting k8s clusters, but also for managing access to their clusters. Controllers and human users can request access to a cluster by creating an `AccessRequest` resource which looks like this:
```yaml
apiVersion: clusters.openmcp.cloud/v1alpha1
kind: AccessRequest
metadata:
  name: my-access
  namespace: my-namespace
  labels:
    # ClusterProviders must only act on AccessRequests where these two labels are set
    # and the value of the first one matches their own provider name.
    clusters.openmcp.cloud/provider: myprovider
    clusters.openmcp.cloud/profile: default.myprovider.myprofile
spec:
  clusterRef: # optional, takes precedence over requestRef if set
    name: my-cluster
    namespace: foo

  requestRef: # optional, at least one of clusterRef and requestRef must be set
    name: my-request
    namespace: bar

  token: # either token or oidc
    permissions:
    - name: foo # optional, not required usually
      namespace: test # optional, results in Role if set and in ClusterRole otherwise
      rules:
      - apiGroups:
        - "*"
        resources:
        - "*"
        verbs:
        - "*"
    roleRefs:
    - kind: ClusterRole
      name: my-clusterrole

  oidc: # either token or oidc
    name: my-oidc-provider
    issuer: https://oidc.example.com
    clientID: my-client-id
    usernameClaim: sub # optional
    usernamePrefix: "my-user:"
    groupsClaim: group # optional
    groupsPrefix: "my-group:"
    extraScopes:
    - foo
    roleBindings:
    - subjects:
      - kind: User
        name: foo
      - kind: Group
        name: bar
      roleRefs:
      - kind: ClusterRole
        name: my-cluster-role
      - kind: Role
        name: my-role
        namespace: default
    roles:
    - name: my-admin
      rules:
      - apiGroups:
        - "*"
        resources:
        - "*"
        verbs:
        - "*"
```

Note that, while the example shows both, an `AccessRequest` must have exactly one of `spec.token` and `spec.oidc` set, not both.

#### Token-based Access

If `spec.token` is set, a token-based access is requested. The ClusterProvider is expected to create a `ServiceAccount`, create `Role` (if `namespace` is not empty) and `ClusterRole` (if `namespace` is empty) resources for each entry in `spec.token.permissions`, and create `RoleBinding` and `ClusterRoleBinding` resources for each entry in `spec.token.permissions` and each entry in `spec.token.roleRefs`.

Since token-based access is based on standard RBAC and TokenRequest APIs, it should work on any k8s cluster and is expected to be supported by every ClusterProvider.

#### OIDC-based Access

If `spec.oidc` is set, OIDC-based access is requested. Most fields within `spec.oidc` are required for setting up the trust relationship.
`extraScopes` is meant to be used for the `oidc-login` kubectl plugin that handles OIDC authentication.
`roleBindings` specifies (Cluster)RoleBindings that should be created, while `roles` can be used to construct additonal (Cluster)Roles.

Note that not every ClusterProvider might support OIDC-based access and requesting it could result in an error or a denied request.

> The `spec.oidc` field contains a nested struct named `OIDCProviderConfig` that has a `Default()` method. Whenever reading data from this field, it is strongly recommended to have run the `Default()` method first, because it will take care of setting some defaults, such as appending a `:` suffix to the username and groups prefixes, if it doesn't exist.

#### The Preparation of AccessRequests

From a 'raw' `AccessRequest`, it is not immediately obvious which ClusterProvider is responsible:
If `spec.clusterRef` is not set, first the `ClusterRequest` that is referenced in `spec.requestRef` needs to be fetched. From there, the `Cluster` needs to be fetched, which again leads to the `ClusterProfile` and only then the provider knows whether it is responsible or not.

To avoid having to implement this flow in every ClusterProvider and have all ClusterProviders executing it whenever any `AccessRequest` changes, there exists a 'generic' AccessRequest controller that takes over this task. This generic controller reacts _only_ on `AccessRequest` resources that do not have both the `clusters.openmcp.cloud/provider` _and_ the `clusters.openmcp.cloud/profile` labels.
It modifies the `AccessRequest` in the following way:
- It adds the `clusters.openmcp.cloud/provider` label with the provider name (extracted from the `ClusterProfile`) as value.
- It adds the `clusters.openmcp.cloud/profile` label with the `ClusterProfile` name as value.
- If `spec.clusterRef` is empty, it resolves the `ClusterRequest` reference and fills `spec.clusterRef` with the information from the ClusterRequest's status.

This means that the AccessRequest controller in a ClusterProvider must only act on AccessRequests that have both of the aforementioned labels set. They can then expect `spec.clusterRef` to be set and don't need to check for `spec.requestRef`.

It is recommended to use [event filtering](./general.md#event-filtering) to avoid reconciling AccessRequests that belong to another provider or have not yet been prepared by the generic controller. The controller-utils library contains a `HasLabelPredicate` filter that can be used for both, verifying existence of a label as well as checking if it has a specific value:
```go
import (
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/predicate"
	ctrlutils "github.com/openmcp-project/controller-utils/pkg/controller"
	clustersv1alpha1 "github.com/openmcp-project/openmcp-operator/api/clusters/v1alpha1"
)

// SetupWithManager sets up the controller with the Manager.
func (r *AccessRequestReconciler) SetupWithManager(mgr ctrl.Manager) error {
  return ctrl.NewControllerManagedBy(mgr).
    For(&clustersv1alpha1.AccessRequest{}).
    WithEventFilter(predicate.And(
      // this checks whether the provider label exists and has the correct value
      // 'providerName' holds the value that was passed into the ClusterProvider via the '--provider-name' argument
      ctrlutils.HasLabelPredicate(clustersv1alpha1.ProviderLabel, providerName),
      // this just checks whether the label exists, independent from its value
      ctrlutils.HasLabelPredicate(clustersv1alpha1.ProfileLabel, ""),
      // <potentially more event filters>
    )).
    Complete(r)
}
```
