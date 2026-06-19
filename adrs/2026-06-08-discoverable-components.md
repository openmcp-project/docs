---
authors:
  - MoritzMarby
  - ValentinGerlach
  - MaximilianTechritz
---

# Discoverable Artifacts

This ADR defines how consumers discover the location of OCI artifacts for different services.

For example, a service provider such as `crossplane-service-provider`, running inside the openMCP platform, needs to know where to fetch the Crossplane Helm chart and container image from. This ADR defines the solution.

## Terminology

- **OCM** - [Open Component Model](https://ocm.software). Secure delivery for sovereign clouds - deliver and deploy your software securely, anywhere, at any scale. A specification and toolset for describing software components and their resources (images, charts, blobs) in a transport-agnostic way.
- **OCM Component** - a single, versioned unit described by OCM. It carries a set of `resources` (e.g. an OCI image, a Helm chart) and may reference other components via [`componentReferences`](https://ocm.software/docs/reference/component-constructor/#components-componentreferences).
- **Service OCM Component** - an OCM component that represents a single service the platform can install (e.g. `flux`, `crossplane`). It lists all OCM resources that this service needs at a given version (chart, controller images, etc.).
- **Umbrella OCM Component** - an OCM component that contains no resources of its own and only carries `componentReferences` to other OCM components. Used to group a set of service OCM components into one entry point. In this ADR, the `Releasechannel` is the umbrella OCM component.

## Current state

### Service Providers

Each Service Provider is deployed by creating a `ServiceProvider` resource in which the OCI image URL of the provider is specified directly:

```yaml
# From service-provider-flux
apiVersion: openmcp.cloud/v1alpha1
kind: ServiceProvider
metadata:
  name: flux
  namespace: openmcp-system
spec:
  image: ghcr.io/openmcp-project/images/service-provider-flux:v0.1.0
```

The `ProviderConfig` resource of a Service Provider defines which versions of the managed service are available. For each version, all OCI artifact URLs (Helm chart and container image) as well as pull secrets for private registries must be specified manually:

```yaml
# From service-provider-crossplane
apiVersion: crossplane.services.open-control-plane.io/v1alpha1
kind: ProviderConfig
metadata:
  name: default
spec:
  versions:
    - version: v2.0.2
      chart:
        url: "ghcr.io/openmcp-project/openmcp/charts/crossplane:2.0.2"
        secretRef:
          name: ghcr
      image:
        url: "ghcr.io/openmcp-project/openmcp/images/crossplane:2.0.2"
        secretRef:
          name: xyz
    - version: v1.20.0
      chart:
        url: "ghcr.io/openmcp-project/openmcp/charts/crossplane:1.20.0"
        secretRef:
          name: ghcr
      image:
        url: "ghcr.io/openmcp-project/openmcp/images/crossplane:1.20.0"
        secretRef:
          name: xyz
  providers:
    availableProviders:
      - name: provider-kubernetes
        package: xpkg.upbound.io/upbound/provider-kubernetes
        versions:
          - v0.16.0
          - v0.15.0
    imagePullSecretRefs:
      - name: secretforprivateproviders
```

```yaml
# From service-provider-flux
apiVersion: flux.services.open-control-plane.io/v1alpha1
kind: ProviderConfig
metadata:
  name: flux
spec:
  versions:
    - version: "2.8.3"
      chartVersion: "2.18.2"
      chartUrl: "oci://ghcr.io/fluxcd-community/charts/flux2"
      chartPullSecret: "chart-registry-credentials"
      values:
        imagePullSecrets:
          - name: "image-registry-credentials"
        helmController:
          image: my-registry.example.com/fluxcd/helm-controller
          tag: v1.5.3
        sourceController:
          image: my-registry.example.com/fluxcd/source-controller
          tag: v1.8.1
```

### Platform Services

When installing a Platform Service, the OCI image URL of the controller is specified directly in the `PlatformService` resource:

```yaml
# From platform-service-gateway
apiVersion: openmcp.cloud/v1alpha1
kind: PlatformService
metadata:
  name: gateway
spec:
  image: ghcr.io/openmcp-project/images/platform-service-gateway:v0.1.0
```

A Platform Service may additionally expose a service-specific configuration resource in which image URLs and Helm chart locations for its dependencies must be configured manually:

```yaml
# From platform-service-gateway - GatewayServiceConfig
apiVersion: gateway.openmcp.cloud/v1alpha1
kind: GatewayServiceConfig
metadata:
  name: gateway
spec:
  envoyGateway:
    images:
      proxy: "ghcr.io/openmcp-project/components/github.com/openmcp-project/openmcp/images/envoy-proxy:distroless-v1.36.2"
      gateway: "ghcr.io/openmcp-project/components/github.com/openmcp-project/openmcp/images/envoy-gateway:v1.5.4"
      rateLimit: "ghcr.io/openmcp-project/components/github.com/openmcp-project/openmcp/images/envoy-ratelimit:99d85510"
    chart:
      url: "oci://ghcr.io/openmcp-project/components/github.com/openmcp-project/openmcp/charts/envoy-gateway"
      tag: "1.5.4"
  clusters:
    - selector:
        matchPurpose: platform
    - selector:
        matchPurpose: workload
  dns:
    baseDomain: dev.openmcp.example.com
```

### Cluster Providers

When installing a Cluster Provider, the OCI image URL is specified directly in the `ClusterProvider` resource:

```yaml
# From cluster-provider-gardener
apiVersion: openmcp.cloud/v1alpha1
kind: ClusterProvider
metadata:
  name: gardener
spec:
  image: "ghcr.io/openmcp-project/images/cluster-provider-gardener:v0.2.0"
```

## New Solution

A centrally managed, platform-provided mechanism for resolving the location of OCI images.

### Requirements

- Multiple versions of an artifact must be storable.
- The solution must support local development.
- Pull secrets for an artifact should be inherited.

### Flows That Must Be Supported

1. Retrieve all versions of an artifact, e.g. `crossplane-chart`.
2. Retrieve the pull secrets for artifact `crossplane-chart` at version `v1.10`.
3. Different versions of an artifact may originate from different registries.

## Scope

### In Scope

- OCI images and artifacts only.
- How `ServiceProvider`, `PlatformService`, and `ClusterProvider` discover what artifacts are available and where to fetch them from.
- Defining the structure of the `Releasechannel` OCM component.

### Out of Scope

- The user-facing API for selecting a service version (e.g. how an end user requests "Flux v2.2.0"). To be discussed in a follow-up ADR.
- How a `Releasechannel` is built, signed, or published. Only its structure is defined here.
- Lifecycle and rollout of `Releasechannel` versions.

## Proposal

The platform builds a `Releasechannel` umbrella OCM component as the single source of truth for what is installable, in which versions, and where to fetch it from. This part is common to both approaches below.

The two approaches differ only in **how consumers read from the `Releasechannel`**:

- **Approach A - Direct OCM consumption.** Consumers query the `Releasechannel` through OCM controllers. Requires upstream OCM controller features that do not exist yet.
- **Approach B - Artifacts API translation layer.** The platform translates the resolved OCM content into `Artifact` Kubernetes resources. Consumers read those instead of OCM directly. Optional addition, independent of the upstream OCM roadmap.

## Releasechannel OCM Component

A single umbrella OCM component, `Releasechannel`, acts as the entry point for all artifacts the platform knows about. The cluster is configured with one piece of information - the `Releasechannel` version to consume - and discovers everything else from its content.

### Structure

`Releasechannel` is a pure pointer component. It contains no resources of its own; it only carries [`componentReferences`](https://ocm.software/docs/reference/component-constructor/#components-componentreferences) to per-service OCM components.

Each `componentReference` is a direct `(name, version)` reference to another OCM component. There is no grouping layer in between, so multiple versions of the same service appear as separate entries:

```
Releasechannel v1.8.9
├── componentReference: flux       v2.2.0
├── componentReference: flux       v2.1.0
├── componentReference: crossplane v2.0.0
└── …
```

Each per-service OCM component lists its OCM resources - for example, the flux component at `v2.2.0` carries:

- helm chart
- helm-controller image
- kustomize-controller image
- source-controller image
- notification-controller image
- …

A consumer that picks "flux at version `v2.2.0`" resolves through the matching `componentReference` into the concrete set of resources (chart + controller images) that this version of flux ships.

### Why this structure

The customer installs a **service component version**, not individual resource versions. Saying "install flux v2.2.0" must be enough for the platform to know which chart and which controller images to pull. OCM performs that resolution natively once the components are structured this way; the platform does not need its own version-mapping layer.

Listing each version as its own `componentReference` also makes "which versions of flux are available?" answerable by enumerating the references of the current `Releasechannel`.

### Why OCM

The choice of OCM as the underlying mechanism is deliberate. OCM gives the platform two properties that are hard to get otherwise:

- **Localization / transport.** A whole `Releasechannel`, including every referenced service OCM component and every resource (chart, image) it transitively pulls in, can be transported to a different OCI registry as a single unit using OCM tooling. Consumers then point at the new registry and continue to operate without any other change.
- **Air-gapped deployments.** The same property makes air-gapped environments approachable: mirror the `Releasechannel` once, and all artifacts the platform needs are reachable inside the isolated network.

Building a comparable mechanism on top of plain OCI references would mean re-implementing transport, signing, and integrity checks that OCM already provides.

These same properties are the reason the whole openMCP platform is itself bundled and released as one umbrella OCM component - see [openmcp-project/openmcp](https://github.com/openmcp-project/openmcp). Using OCM for the `Releasechannel` keeps the discovery layer aligned with how the platform itself is delivered.

### Scope of consumers

Although the ADR is motivated by `ServiceProvider` resolving service artifacts, the concept is intentionally open: any part of the platform that needs to know where an OCI artifact lives can infer it from the same `Releasechannel`. In particular, the install image of a `PlatformService` or a `ClusterProvider` can be discovered the same way as a service's chart or controller image. The `Releasechannel` is the single source of truth for "what is installable, in which versions, and where to fetch it from".

### Hosting

In production, a `Releasechannel` is published to an OCI registry. The cluster only needs to know the registry URL and `Releasechannel` version; everything else is discovered in-cluster from the resolved component graph.

For local development, kind-based e2e, or quick try-out scenarios, requiring an OCI registry to host a `Releasechannel` is a hard external dependency. The two approaches below address this differently.

## Approach A - Direct OCM consumption

Consumers (`ServiceProvider`, `PlatformService`, `ClusterProvider`) read the `Releasechannel` through OCM controllers directly. No intermediate Kubernetes API on the platform side.

### Required OCM controller capabilities

This approach depends on two capabilities of the upstream OCM controllers that do not exist in their current form:

1. **Discovery from an umbrella component.** Today, OCM controllers require both the component name and the resource name to be specified explicitly (1:1 lookup). Approach A needs the controllers to enumerate `componentReferences` of a `Releasechannel` and, per service component, enumerate the available resources in-cluster. Tracked upstream in [open-component-model/ocm-project#1153](https://github.com/open-component-model/ocm-project/issues/1153).
2. **Local-YAML fallback for offline scenarios.** A way to back the lookup with a plain YAML file pointing at upstream registries, so that local development and e2e tests do not require an OCI registry hosting a full `Releasechannel`. Discussed with OCM maintainers; no public issue yet.

## Approach B - Artifacts API translation layer

An optional addition on top of Approach A. The platform introduces a new Kubernetes API that materialises the resolved content of the `Releasechannel` as in-cluster resources. Consumers read those resources instead of querying OCM directly.

The `Releasechannel` remains the source of truth in production: a translation layer reads it via OCM and creates the corresponding `Artifact` resources. In local or e2e setups, `Artifact` resources can be applied directly without an OCI registry, removing the dependency on the upstream OCM features listed in Approach A.

### Artifacts

A new resource in the `platform` cluster called `Artifact`. Each `Artifact` points to exactly one OCI image.

```yaml
kind: Artifact
metadata:
  name: crossplane-chart-v1.20.0
spec:
  name: crossplane-chart
  version: v1.20.0
  url: ghcr.io/crossplane/crossplane:v1.20.0@sha:23426...
  pullsecrets:
    - name:
      namespace:
```

The `metadata.name` of an `Artifact` is arbitrary.
Artifacts are intended to be retrieved by their `spec` fields using a `fieldSelector`.
<!-- TODO: Valentin -->

The `spec.version` field is not the same as the `tag` of the underlying OCI image. The version represents the version of the parent component that a user selects.
For example, `crossplane` is a component that consists of two artifacts: the `chart` and the `image`. There will therefore be two `Artifact` resources:

```yaml
kind: Artifact
metadata:
  name: crossplane-image-v1.20.0
spec:
  name: crossplane-image
  version: v2.1.2
  url: ghcr.io/crossplane/crossplane:v2.1.2@sha:23426...
  pullsecrets:
    - name:
      namespace:
---
kind: Artifact
metadata:
  name: crossplane-chart-v1.20.0
spec:
  name: crossplane-chart
  version: v1.20.0
  url: ghcr.io/crossplane/crossplane-chart:v1.20.0@sha:23426...
  pullsecrets:
    - name:
      namespace:
```

Both artifacts carry different image tags but share the same component version. A consuming entity can therefore resolve: "for component version `v1.20.0`, use chart tag `v1.20.0` and image tag `v2.1.2`."

![Discoverable Artifacts](./2026-06-08-discoverable-artifacts.excalidraw.svg)

### ProviderConfig Example

Every `ServiceProvider` has a `ProviderConfig` resource. To inform the `ServiceProvider` how to locate the relevant `Artifact` resources, selectors are defined in the `ProviderConfig`.

Example for the `ServiceProvider` Crossplane:

```yaml
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: ProviderConfig
spec:
  chart:
    selectors:
      matchFields:
        - artifactName: crossplane-chart
  image:
    selectors:
      matchFields:
        - artifactName: crossplane-image
  providers:
    selectors:
      matchLabels:
        crossplane.open-control-plane.io/type: "provider"
  functions:
    selectors:
      matchLabels:
        crossplane.open-control-plane.io/type: "functions"
```


<!-- TODO: Point out difference between artifactVersion and componentVersion -->

## Pros and Cons

Both approaches share the `Releasechannel` OCM component as the source of truth. The trade-off is purely in the consumption path.

### Approach A - Direct OCM consumption

**Pros**

- Single source of truth, single read path: consumers resolve the `Releasechannel` directly via OCM.
- No additional CRD or controller logic to maintain on the platform side.
- Lowest overall complexity once the upstream OCM features are in place.

**Cons**

- Blocked on upstream OCM controller features that do not yet exist (umbrella-component discovery, see [open-component-model/ocm-project#1153](https://github.com/open-component-model/ocm-project/issues/1153); local-YAML fallback for offline use).
- Local development, kind-based e2e, and try-out scenarios are only viable once the local-YAML fallback exists upstream.
- Platform's delivery timeline is coupled to the OCM upstream roadmap.

### Approach B - Artifacts API translation layer

**Pros**

- Decouples the platform from the upstream OCM roadmap: ships independently of [open-component-model/ocm-project#1153](https://github.com/open-component-model/ocm-project/issues/1153) and the local-YAML fallback.
- Local development and e2e tests work by applying `Artifact` resources directly into a kind cluster - no OCI registry, no OCM controller features required.
- Consumers see a plain Kubernetes API with selectors, familiar to anyone working with CRDs.

**Cons**

- Adds a CRD that the platform must own and maintain on top of the OCM-based source of truth.
- Requires a translation layer from resolved OCM components to `Artifact` resources, which is additional code to write, test, and operate.
- Increases overall complexity: the platform maintains both the API and the OCM-to-Artifact bridge instead of relying on OCM end-to-end.
- Two representations of the same data in production raise the surface for drift and bugs.

## Decision

_To be discussed with the team. Intentionally left empty._
