
status: proposed<br>
date: 2025-03-21<br>
deciders: Johannes Aubart, Valentin Gerlach, Rene Schünemann<br>
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

### The 'ClusterRequest' API Type and the Scheduler

As one might notice, an entity that wants a cluster must still know about the available `ClusterProviders` and their profiles, in order to request one. For this reason, we designed the `ClusterRequest` resource:
```yaml
apiVersion: cluster.openmcp.cloud/v1alpha1
kind: ClusterRequest
metadata:
  name: foo
  namespace: bar
spec:
  purpose: mcp
status:
  observedGeneration: 3
  lastReconcileTime: "2021-07-01T00:00:00Z"
  phase: "Granted" # one of Granted, Denied, Pending
  reason: "Success"
  message: "Cluster is ready"
  conditions: <...> # probably not needed, but lets use the same status where applicable
  clusterRef:
    name: my-mcp
    namespace: abcdefg
    prefix: a3fb7902-
```

The idea is that entities which need to schedule workload or use the k8s API but don't really care about the cluster that is used for this can request an off-the-shelf cluster via a `ClusterRequest`. The important thing is that not each `ClusterRequest` results in its own k8s cluster. Instead, depending on the request, an existing cluster might be returned. This allows multiple entities that just need to schedule some workload to share the same k8s cluster, instead of each one getting a dedicated cluster for this.

In addition to the `clusterRef` in the status, the `Cluster` resource will get a finalizer pointing to the `ClusterRequest`. This allows us to use the same clusters for the same requests, if the status is ever lost, and it makes it easy to figure out the number of requests currently pointing to the same cluster.

The `clusterRef.prefix` field is guaranteed by the scheduler to be unique among all requests pointing to the same cluster. The entity that issued the request can prefix cluster-scoped resources with this to avoid naming collisions.

For the beginning, we decided for a very primitive scheduler: As a static configuration, the scheduler gets a mapping from purposes to `Cluster` templates, similar to this:
```yaml
purposes:
  mcp:
    tenancyCount: 0 # mcp clusters are never shared
    clusterTemplate:
      clusterProviderRef:
        name: gardener
        profile: aws-workerless
      kubernetes:
        version: "1.20.3"
  platform:
    tenancyCount: -1 # no limit of ClusterRequests pointing to the same Cluster
    clusterTemplate: <...>
  workload:
    tenancyCount: 20 # up to 20 ClusterRequests may specify the same workload cluster, the 21st needs to create a new one
    clusterTemplate: <...>
```

The scheduler simply counts the number of `ClusterRequests` pointing to the same `Cluster` and creates a new `Cluster`, once a certain threshold is reached. We plan to use a more sophisticated logic based on load metrics at some point later on.

The `tenancyCount` determines how the cluster is shared:
- a value of `0` means that the cluster is exclusive and will never be shared
- a negative value means that the cluster is shared by an unlimited amount of entities
- a positive value means that the cluster is shared by at max this amount of entities

Note that a `tenancyCount` of `1` behaves similar to one of `0` on first glance, the difference is that the cluster is marked as shared and might potentially get more workload scheduled on at a later point in time (e.g. when we change the scheduler implementation).

#### ClusterRequest Response: ClusterRequest spec vs ClusterRequest status vs ClusterRequestGrant spec

The question is where to expose the response to a `ClusterRequest`:
- the `ClusterRequest`'s spec
- the `ClusterRequest`'s status
- a separate resource

##### Decision

We use the `ClusterRequest` status for this.

##### Reason

The most intuitive place for this information seems to be the status of the `ClusterRequest` resource. Since that must be recoverable if lost by k8s specification, the `Cluster` resource referenced by the `ClusterRequest` gets a back-reference in form of a finalizer.

#### Collision Avoidance in Shared Clusters

As mentioned in the goals, sharing clusters between multiple controllers is a desired feature of the system. But this opens up the problem of naming collisions in cluster-scoped resources: If two controllers that share the same cluster both try to use a namespace `foo` for their resources, things will break in a really ugly manner. To avoid this, some kind of naming restrictions are required.

Regular expressions are great for validating if a name follows a specific restriction, but it is neither trivial to generate valid strings out of a regular expression, nor to check if the sets of strings defined by two regular expressions overlap. They are therefore not really suited for this scenario.

Prefixes are a rather primitive but effective way of preventing naming collisions. We just have to ensure that the same prefix is not in use twice and that no prefix is itself a prefix of another prefix.

##### Decision

We use a prefix for collision avoidance. The prefix is automatically generated by the scheduler, probably some kind of hash over the request's name and namespace.

### The 'AccessRequest' API Type

For improved security, `Cluster` resources don't simply put an admin kubeconfig in a secret for everyone to use. Instead, a controller that needs access to a specific cluster has to create an `AccessRequest` resource.

```yaml
apiVersion: cluster.openmcp.cloud/v1
kind: AccessRequest
metadata:
  name: foo
  namespace: bar
spec:
  clusterRef:
    name: <...>
    namespace: <...> # optional, defaults to metadata.namespace
  permissions:
  - namespace: my-namespace
    rules: <RBAC rules, same as in (Cluster)Roles>
  - rules: <RBAC rules, same as in (Cluster)Roles>
status:
  observedGeneration: 3
  lastReconcileTime: "2021-07-01T00:00:00Z"
  phase: "Granted" # one of Granted, Denied, Pending
  reason: "Success"
  message: "Cluster is ready"
  conditions: <...> # probably not needed, but let's use the same status where applicable
  access:
    validity:
      startsAt: "2021-07-01T00:00:00Z"
      expiresAt: "2022-07-01T00:00:00Z"
    secretRef:
      name: foo-access
```

An `AccessRequest` references a `Cluster` and requests a set of permissions. The optional `namespace` field determines whether it results in a `Role` (if the namespace is set) or a `ClusterRole` (if it is not set), the `rules` are simply passed through in the respective resource. All under the assumption, that the request is granted, of course.

The resulting access should be scoped exactly to the requested permissions.

#### Which AccessRequests to Grant?

How does the responsible controller decide whether to grant or deny an `AccessRequest`? In k8s, the user that creates a resource is not known (unless a webhook is used), so the information who created the request is hard to use.

##### Decision

For the beginning, all `AccessRequests` will be granted. We think about a better solution later on.

#### The Initial Access Problem

While the idea that every entity that needs access to a cluster requests it via the `AccessRequest` resource is quite nice, it leaves the problem that the controller that handles these requests needs admin permissions on each `Cluster` in order to create the respective (Cluster)Roles and ServiceAccounts. How does this controller gain access to the clusters?

If we have each `Cluster` resource expose its admin access in some secret, we again have admin secrets lying around, which we wanted to avoid. An OIDC-based approach might not be possible for every cluster provider implementation (not sure if _kind_ clusters support this, for example).

##### Decision

The ClusterProviders are responsible for handling AccessRequests pointing to their clusters. They always have admin access to their created clusters (or know how to get it).

#### What does the Access Information look like?

We definitely need a well-defined format for the access information exposed by the `AccessRequest`. Is one enough, or do we have multiple formats, e.g. one for token-based access and a different format for OIDC-based access? How does the granting entity decide which format to expose? Do we need a value in the spec to specify the desired access type?

##### Decision

For the beginning, the `AccessRequest` will always result in a token-based kubeconfig. We plan to add OIDC-based access later on, although some ClusterProviders (e.g. _kind_) don't support this and will always fallback to token-based access.


<!-- markdownlint-disable-file MD013 -->
