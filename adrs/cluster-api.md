
status: proposed<br>
date: 2025-03-14<br>
deciders: D064470, D067641, D073016<br>
<hr>
<!-- we need to disable MD025, because we use the different heading "ADR Template" in the homepage (see above) than it is foreseen in the template -->
<!-- markdownlint-disable-file MD025 -->

# Cluster API

## Context and Problem Statement

We would like to create k8s clusters from code. There are several use-cases and constraints that we want to be able to handle:

#### Landscape Setup

We have to create multiple clusters during the setup (or update) of an MCP landscape. These cluster should also be managed by our solution. Especially the first one is interesting, because after that, we use it to deploy k8s controllers which can then handle the other clusters.

#### Support for multiple Cluster Providers

A major problem of our current landscape-setup as well as the MCP landscape itself is that it is very hard to test changes before deploying them. We want to fix this by having a mostly provider-agnostic way of requesting clusters and multiple cluster providers that implement it. We want to be able to run everything locally, e.g. by using _kind_ cluster, the same way we would run it productively (e.g. using _Gardener_ clusters).
To achieve this, it must be possible to request clusters without caring about the ClusterProvider that will actually provision them.

#### Simplicity

Most of our clusters look really similar and all of them are more or less standard k8s clusters. We don't have the need to fine-tune every aspect of the clusters and prefer a simple approach over an unnecessary powerful but complex one (e.g. the official cluster-api project).

#### Shared Clusters

We have some cases in which we need to schedule workload and don't really care where it is run. Spinning up a new cluster for each of these cases would be inefficient, so we want to be able to use existing clusters for multiple workloads. It must be possible to influence whether a request for a cluster results in a new k8s cluster or in access to an existing one which is also used by other controllers.

## API and Decisions

### Official Cluster-API Project vs. own Implementation

#### Considered Options

Either use the [official cluster-api](https://cluster-api.sigs.k8s.io/) or implement our own logic.

#### Decision

We will implement our own logic, although we might take inspiration from the cluster-api project.

#### Reason

See 'Simplicity' - the cluster-api project seems really powerful, but it is also quite complex and we would like to avoid the latter one and have no need for the former one. Also, two of our use-cases - local setup via _kind_ and productive setup via _Gardener_ - seem to not be supported by the cluster-api project. For _Gardener_, some work has been done, but it does not seem finished.

### The 'ClusterProvider' API Type

```yaml
# cluster-scoped
apiVersion: cluster.openmcp.cloud/v1alpha1
kind: ClusterProvider
metadata:
  name: gardener
spec:
  package: registry.example.com/gardener-cluster-provider:v1.0.0
  packagePullSecret:
  - name: foo
status:
  observedGeneration: 3
  lastReconcileTime: "2021-07-01T00:00:00Z"
  ready: true
  reason: AllGood
  message: "The provider is ready."
  conditions:
  - type: ProviderReady
    status: "True"
    lastTransitionTime: "2021-07-01T00:00:00Z"
    reason: <...>
    message: <...>
  profiles:
  - name: aws
    providerConfigRef:
      name: aws
    supportedVersions:
    - version: 1.19.1
      deprecated: true
    - version: 1.19.2
      deprecated: true
    - version: 1.20.0
    - version: 1.20.1
    - version: 1.20.3
    supportedTraits:
    - name: infrastructure/vendor/aws
    - name: kubernetes.io/apis/compute
  - name: aws-workerless
    providerConfigRef:
      name: aws
    supportedVersions:
    - version: 1.19.1
      deprecated: true
    - version: 1.19.2
      deprecated: true
    - version: 1.20.0
    - version: 1.20.1
    - version: 1.20.3
    supportedTraits:
    - trait: infrastructure/vendor/aws
    - trait: cluster.openmcp.cloud/workerless
```

A `ClusterProvider` represents a specific instance of a cluster provider. The configuration is minimal, ideally just a path to an OCI artifact. The openmcp-operator (OMCPO) deploys the corresponding controller, which requires that all cluster provider implementations can be deployed exactly the same way.

The configuration comes from additional resources, which are specific to the provider implementation. An example could look like this:
```yaml
# cluster-scoped
apiVersion: gardener.cluster.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: aws
spec:
  providerRef: gardener
  gardenKubeconfigRef:
    type: Secret
    name: my-secret
  shootTemplate: <...>
---
apiVersion: gardener.cluster.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: gcp
spec:
  providerRef: gardener
  gardenKubeconfigRef:
    type: Secret
    name: my-secret
  shootTemplate: <...>
```

After the cluster provider has started, it searches for instances of its own configuration resources, interpretes them, and exposes supported _profiles_ in its status. These profiles include available k8s versions as well as _traits_. An explanation of how traits work follows further down.

#### ClusterProvider and ProviderConfig: 1:1 vs 1:n vs 1:1:n

The original idea was that each `ClusterProvider` references exactly one `ProviderConfig` (1:1).

The current approach uses any amount of `ProviderConfigs` for the same `ClusterProvider` (1:n).

We also shortly discussed a hybrid approach, where each `ClusterProvider` references one `ProviderConfig`, but each `ProviderConfig` is connected to multiple `Flavors` (1:1:n).

##### Decision
We favor the 1:n variant. The idea is that each `ClusterProvider` implementation is only deployed once.

##### Reason
The 1:1 approach has the disadvantage that if multiple `ProviderConfigs` are required, the same `ClusterProvider` implementation has to be deployed multiple times, which is unnecessary. The 1:1:n approach has more overhead than the 1:n option and is actually not more powerful: There is no requirement that each `ProviderConfig` has to result in exactly one profile. It would still be possible to e.g. create an `aws` `ProviderConfig`, which references further provider-specific `MachineType` resources, like a `gardenlinux` and a `workerless` one, so that the `aws` `ProviderConfig` results in two profiles, `aws:gardenlinux` and `aws:workerless` or something similar.

### The 'Cluster' API Type

```yaml
apiVersion: cluster.openmcp.cloud/v1alpha1
kind: Cluster
metadata:
  name: my-mcp
  namespace: abcdefg
spec:
  clusterProviderRef:
    name: gardener
    profile: aws-workerless
  clusterConfigRef: # optional
    apiGroup: gardener.cluster.openmcp.cloud
    kind: ClusterConfig
    name: abc
  kubernetes:
    version: "1.20.3"
  purposes:
  - mcp
status:
  observedGeneration: 3
  lastReconcileTime: "2021-07-01T00:00:00Z"
  phase: Succeeded
  conditions:
  - type: ClusterHealthy
    status: "True"
    lastTransitionTime: "2021-07-01T00:00:00Z"
    reason: <...>
    message: <...>
  providerStatus: # optional
    <...>
```

`Cluster` resources represent k8s clusters. They reference a `ClusterProvider` and one of its exposed _profiles_. A `Cluster` can also reference a provider-specific `ClusterConfig` resource. However, this is not only optional, but we actually want `Clusters` with a referenced config to be the exception, not the norm. Since we only have a very limited number of cluster archetypes in use in our current landscapes, this should be possible.

The `purposes` are mostly for informative reasons in the `Cluster` resource, but more on that later.

The `providerStatus` field is only interpreted by the provider responsible for the cluster and can be used to store relevant information. Keep in mind that kubernetes considers the `status` to be volatile though, meaning it must only contain information that can be recovered if the status is lost.

There haven't been any big discussions regarding the `Cluster` resource, we pretty much imagined it something like this from the very beginning.

### The 'ClusterRequest' API Type

As one might notice, an entity that wants a cluster must still know about the available `ClusterProviders` and their profiles, in order to request one. For this reason, we designed the `ClusterRequest` resource:
```yaml
apiVersion: cluster.openmcp.cloud/v1alpha1
kind: ClusterRequest
metadata:
  name: foo
  namespace: bar
spec:
  kubernetes:
    version: "1.30" # none, partial, or full k8s version
  dedicated: false # optional, intended to be omitted here and derived from purposes
  purposes:
  - platform
  - onboarding
  traits:
  - trait: foo/bar/baz
    optional: true
    negated: false
  prefix: foo-
status:
  observedGeneration: 3
  lastReconcileTime: "2021-07-01T00:00:00Z"
  status: "Granted" # one of Granted, Denied, Pending
  reason: "Success"
  message: "Cluster is ready"
```

The idea is that entities which need to schedule workload or use the k8s API but don't really care about the cluster that is used for this can request an off-the-shelf cluster via a `ClusterRequest`. The important thing is that not each `ClusterRequest` results in its own k8s cluster. Instead, depending on the request, an existing cluster might be returned. This allows multiple entities that just need to schedule some workload to share the same k8s cluster, instead of each one getting a dedicated cluster for this.


The request specifies desired and required properties of the cluster:
- `kubernetes.version` can be omitted or used to specify either a partial or full k8s version
- `purposes` lists the purposes for which the cluster is intended to be used, see below for further information about purposes
  - Each purpose basically comes with the information whether the cluster is allowed to be shared and some pre-defined traits.
- `dedicated` should be omitted for most cases, but can be used to overwrite the corresponding configuration that is derived from the purposes
  - Basically, if this is `true`, the request will result in a dedicated cluster which will not be shared with other entities.
- `traits` allows to specify desired or required traits (see below for more information on traits)
  - Trait requests which conflict with ones inherited from the purpose(s) overwrite the inherited ones.

The `prefix` field is meant to avoid naming collisions in shared clusters. The requesting entity can use this field to propose a prefix.

`ClusterRequests` will be handled by some kind of scheduler. The request is either denied - `reason` and `message` in its status will show why in that case - or it results in a `ClusterRequestGrant`. This resource will always have the same name and namespace as the `ClusterRequest` it belongs to.

```yaml
apiVersion: cluster.openmcp.cloud/v1
kind: ClusterRequestGrant
metadata:
  name: foo
  namespace: bar
  ownerReferences:
  - apiVersion: cluster.openmcp.cloud/v1alpha1
    kind: ClusterRequest
    name: foo
spec:
  clusterRef: # reference to the cluster
    name: my-cluster
    namespace: my-project
  prefix: foo-
status:
  request:
    metadata:
      name: foo
      namespace: bar
    spec:
      kubernetes:
        version: "1.30"
      dedicated: false
      purposes:
      - platform
      - onboarding
      traits:
      - trait: foo/bar/baz
        optional: true
        negated: false
      prefix: foo-
```

A granted `ClusterRequest` results in a reference to a `Cluster` resource which can be used by the requesting entity.

If the cluster is shared, `prefix` contains a value that is guaranteed to be unique. The requesting entity can be sure that there won't be any naming collisions with other entities' resources, if it prefixes all of its cluster-scoped resources with this prefix. The prefix is
- a random string, if the cluster is shared and 
  - no prefix was proposed in the `ClusterRequest` or
  - the proposed prefix is too short or
  - the proposed prefix was already granted to another `ClusterRequest` referencing the same `Cluster`
- the proposed prefix, if the cluster is shared and none of the above conditions applies
- empty, if the cluster is dedicated

#### ClusterRequest Response: ClusterRequest spec vs ClusterRequest status vs ClusterRequestGrant spec

The question is where to expose the response to a `ClusterRequest`:
- the `ClusterRequest`'s spec
- the `ClusterRequest`'s status
- a separate resource

##### Decision

We use a separate resource `ClusterRequestGrant` for this.

##### Reason

The most intuitive place for this information seems to be the status of the `ClusterRequest` resource. However, per k8s concepts, it should never be a problem if the status is lost, but we must not lose the information here. While a dedicated `Cluster` might have labels pointing to the `ClusterRequest` it was granted for, especially for shared clusters, it might be impossible to figure out which cluster and prefix were granted for a specific `ClusterRequest`, if this information is ever lost. Using the status is therefore a bad idea.

Putting the information in the spec of the `ClusterRequest` would also be possible, but then we would mix fields that the requesting entity has to fill with fields that the scheduler has to fill and the validation that no entity touches a field it is not supposed to change would be annoying.

The easiest way is therefore a separate resource that is linked to the `ClusterRequest` that caused it. Note that only granted `ClusterRequests` result in a `ClusterRequestGrant`.

#### Collision Avoidance in Shared Clusters

As mentioned in the goals, sharing clusters between multiple controllers is a desired feature of the system. But this opens up the problem of naming collisions in cluster-scoped resources: If two controllers that share the same cluster both try to use a namespace `foo` for their resources, things will break in a really ugly manner. To avoid this, some kind of naming restrictions are required.

Regular expressions are great for validating if a name follows a specific restriction, but it is neither trivial to generate valid strings out of a regular expression, nor to check if the sets of strings defined by two regular expressions overlap. They are therefore not really suited for this scenario.

Prefixes are a rather primitive but effective way of preventing naming collisions. We just have to ensure that the same prefix is not in use twice and that no prefix is itself a prefix of another prefix (scoped to `ClusterRequestGrants` pointing to the same cluster).

##### Decision

**===> TBD <===**

None yet, the `prefix` field in its described form is just a proposal.

### The 'AccessRequest' API Type

For improved security, `Cluster` resources don't simply put an admin kubeconfig in a secret for everyone to use. Instead, a controller that needs access to a specific cluster has to create an `AccessRequest` resource.

```yaml
apiVersion: cluster.openmcp.cloud/v1
kind: AccessRequest
metadata:
  name: foo
  namespace: bar
spec:
  clusterRef: # either clusterRef or requestRef
    name: <...>
    namespace: <...> # optional, defaults to metadata.namespace
  requestRef: # either clusterRef or requestRef
    name: <...>
    namespace: <...> # optional, defaults to metadata.namespace
  permissions:
  - namespace: my-namespace
    rules: <RBAC rules, same as in (Cluster)Roles>
  - rules: <RBAC rules, same as in (Cluster)Roles>
status:
  observedGeneration: 3
  lastReconcileTime: "2021-07-01T00:00:00Z"
  status: "Granted" # one of Granted, Denied, Pending
  reason: "Success"
  message: "Cluster is ready"
  access: <...>
```

An `AccessRequest` must either reference a `Cluster`, or, for convenience reasons, a `ClusterRequest`. In the latter case, it technically references a `ClusterRequestGrant`, but since that has the same name and namespace as the `ClusterRequest` it belongs to, this distinction doesn't really matter.

Additionally, it requests a set of permissions. The optional `namespace` field determines whether it results in a `Role` (if the namespace is set) or a `ClusterRole` (if it is not set), the `rules` are simply passed through in the respective resource. All under the assumption, that the request is granted, of course.

The resulting access should be scoped exactly to the requested permissions.

Opposed to the `ClusterRequest`, the response to an `AccessRequest` should not contain any information that cannot be recovered (or recreated without issues) if lost, therefore using the status for the request response is fine in this case.

#### Which AccessRequests to Grant?

How does the responsible controller decide whether to grant or deny an `AccessRequest`? In k8s, the user that creates a resource is not known (unless a webhook is used), so the information who created the request is hard to use.

One option would be accept all `AccessRequests` that are in the same namespace as the `Cluster` or `ClusterRequest` they are referencing. Then, standard k8s RBAC rules can be used to make sure that only entities that should have access to the respective clusters are allowed to create `AccessRequests` in these namespaces.

##### Decision

**===> TBD <===**

#### The Initial Access Problem

While the idea that every entity that needs access to a cluster requests it via the `AccessRequest` resource is quite nice, it leaves the problem that the controller that handles these requests needs admin permissions on each `Cluster` in order to create the respective (Cluster)Roles and ServiceAccounts. How does this controller gain access to the clusters?

If we have each `Cluster` resource expose its admin access in some secret, we again have admin secrets lying around, which we wanted to avoid. An OIDC-based approach might not be possible for every cluster provider implementation (not sure if _kind_ clusters support this, for example).

##### Decision

**===> TBD <===**

#### What does the Access Information look like?

We definitely need a well-defined format for the access information exposed by the `AccessRequest`. Is one enough, or do we have multiple formats, e.g. one for token-based access and a different format for OIDC-based access? How does the granting entity decide which format to expose? Do we need a value in the spec to specify the desired access type?

##### Decision

**===> TBD <===**

### Concept: Traits

Clusters can have certain properties and the entity that requests a cluster might have preferences or requirements regarding these properties. The problem is, that these properties differ between multiple cluster provider implementations. Probably the easiest example: _Gardener_ knows the concept of a 'workerless' cluster, while _kind_ does not.

If we use a well-defined set of enums for these properties, only a subset of them will be relevant for each cluster provider implementation, and we might have to expand the enum every time a new cluster provider is implemented, which kind of contradicts our extensibility concept.

To keep the properties extensible, we use arbitrary strings for traits. That does not mean that they don't have a meaning, though: certain cluster providers might have an understanding of specific traits and not know others. For example, the _Gardener_ cluster provider might know that the `cluster.openmcp.cloud/workerless` trait corresponds to a workerless cluster or that the `infrastructure/vendor/aws` trait means that the cluster is hosted on AWS, while the _kind_ cluster provider does not have an understanding of either of these two traits.

Each cluster provider fills in the `profiles` in the status of its `ClusterProvider` resource, exposing all traits the cluster provider knows of that fit the respective profile. The traits are then used by the scheduler to evaluate fitting clusters when handling `ClusterRequests`.

The difficulty of this approach is that there should always be only one trait that expresses a specific property. If cluster provider A uses trait `X` and cluster provider B uses trait `Y` but both mean the same property with it, an entity cannot express a hard requirement towards this property, because it would have to know in advance if the cluster it will be assigned to comes from A or from B in order to fill in the `ClusterRequest` correctly.

We definitely need a good technical documentation where all known traits and their respective meaning are listed to prevent third-party cluster provider implementations from inventing new traits for properties we already have traits for.

#### Do we need some kind of Equivalence Classes?

Imagine the situation that we named the trait for workerless `cluster.openmcp.cloud/workerless` and someone from the open-source community created an own cluster provider with a trait `foo.bar.baz/nodeless`, which has basically the same meaning as our workerless trait. When we notice that, the nodeless trait has already been in use for some time and the maintainers of the other cluster provider don't want to change it for backward compatibility. There are now two traits with the same meaning. 

A `ClusterRequest` that needs a workerless cluster could specify something like this:
```yaml
  traits:
  - trait: cluster.openmcp.cloud/workerless
    optional: true
  - trait: foo.bar.baz/nodeless
    optional: true
```
This would _likely_ result in a workerless cluster to be granted, but that is not sure and there is no way to enforce this - if `optional` is `false` for either option, the request will be denied if the corresponding cluster provider is not deployed, as there will be no provider that is able to satisfy the requested trait.

To solve this problem, we could introduce a way to define 'equivalences' between traits.

**Option 1: Cluster-wide Equivalences**

The scheduler is given a configuration that contains information about known traits with different names but the same meaning. Both example traits would be in the same group there, so if the scheduler sees a request with either of the two traits, it knows that this requirement can be substituted with the other trait. Furthermore, it could resolve requests that specify both traits into containing either one.

**Option 2: Aggregation Operators in Trait Requests**

Another option to solve this problem would be to allow something like this in the `ClusterRequest`:
```yaml
  traits:
  - or:
    - trait: cluster.openmcp.cloud/workerless
      optional: true
    - trait: foo.bar.baz/nodeless
      optional: true
```

##### Decision

Opposed to option 1, option 2 has the disadvantage that the entity that creates the `ClusterRequest` has to know that there exist multiple traits with the same meaning (at least for this entity). As these "entities" will nearly always be controllers, it might take quite some time until all of them have such an equivalence implemented after a new cluster provider with a duplicate trait shows up.

The advantage of the second approach is that it makes requests significantly more powerful, especially if we add further operators like `and` or `xor`. For example, if a controller needs a feature that is available on both AWS and GCP, it could request a cluster that is based on either one instead of having to decide for one, which would lead to better scheduling.

Technically, nothing prevents us from implementing both options simultaneously, and considering that both come with their own advantages, that might even be a good idea. The price for this is the complexity of the scheduling algorithm, which significantly increases with either option (potentially more with option 2 though, if we go for further operators in addition to `or`).

**===> TBD <===**

### Concept: Purposes

We noticed that we basically have four kinds of clusters in our MCP landscape (current as well as future one):
- `platform` clusters to host the platform operators like the MCP operator (example: the 'core' clusters, e.g. `canary-core`)
- `onboarding` clusters where customers create the resources to request service instances (example: `crate`)
- `workload` clusters to host controllers related to instances (example: the old laas 'target' clusters)
- `mcp` clusters where customers use their services on (the clusters created by `APIServer` resources at the moment)

While tagging our clusters with these purposes is itself a good idea, as it helps developers to understand what the cluster they are looking at is used for, each of these purposes comes with some implicit properties. For example:
- We plan on having only a single `platform` cluster that hosts all platform-relevant controllers.
- We also want to have a single onboarding cluster. That could be the same one as the platform cluster, but it could also be a separate one - and in the latter case, it would be nice if it was workerless, since we do not need to schedule any workload on it.
- Workload clusters should be shared, but they need to be scaled up eventually. At some point, we will have multiple workload clusters, each hosting lots of different 'workload' controllers.
- MCP clusters are not shared and can be workerless (not yet, but in future).

Since we anyway have this knowledge regarding the different purposes, we could take it into account during scheduling.

#### Where are Purposes and their Meaning Defined?

**Option 1: A hard-coded Set of Known Purposes with Implicit Logic**

The first idea was to simply code in exactly the four purposes mentioned above, with the listed implications. This means that the scheduler knows to create a separate workerless cluster for each `ClusterRequest` with purpose `mcp`, while it tries to use existing workload clusters for `ClusterRequests` with purpose `workload`. It is possible to specify multiple purposes, but some combinations (e.g. `platform` and `onboarding`) are more realistic than others (e.g. `mcp` and `workload`).

**Option 2: The 'Purpose' API Type**

Since we are anyway creating API types like confetti, one more doesn't hurt:
```yaml
# cluster-scoped
apiVersion: cluster.openmcp.cloud/v1alpha1
kind: Purpose
metadata:
  name: mcp
spec:
  dedicated: true # don't share MCP clusters
  traits:
  - name: cluster.openmcp.cloud/workerless
    optional: true
    negated: false
```

Instead of having a hard-coded set of known purposes with implicit logic, we make the purposes extensible by defining each one in a `Purpose` resource. Their effect is also not implicit anymore, instead they come with the information whether they are allowed to share a cluster and which traits they request. The simplest `Purpose` would specify `dedicated: false` and not have any `traits`.

A `ClusterRequest` can have multiple purposes (at least one) and additionally specify `dedicated` and `traits`. The information is aggregated as follows:
- The `ClusterRequest` should specify `dedicated` only in special cases. If it does, this is the value that counts and all `dedicated` fields from all listed purposes are ignored. If the `ClusterRequest` does not specify `dedicated`, the values from all listed purposes are ANDed, meaning that the request will result in a dedicated cluster if at least one of the purposes has `dedicated: true`.
- All traits from all purposes and all traits defined in the `ClusterRequest` directly are aggregated. If the same trait is specified multiple times, their `optional` fields are ANDed, and if they have different values for `negated`, the value from the purpose that comes first in the list takes precedence. Traits defined in the `ClusterRequest` directly take precedence over traits inherited from purposes regarding the `negated` field in case of conflicts.

The result will be a single boolean value for `dedicated` and a list of traits where each trait appears only once. This will be used by the scheduler to find (or create) a fitting cluster.

##### Decision

The second option has the advantage of being extensible and not having any implicit meaning behind the purposes. However, it limits their effects to things we can express as traits.

**===> TBD <===**


<!-- markdownlint-disable-file MD013 -->
