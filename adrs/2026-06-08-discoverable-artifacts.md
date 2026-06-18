---
authors:
  - MoritzMarby
  - ValentinGerlach
  - MaximilianTechritz
---

# Discoverable Artifacts

The goal of this ADR is to define the concept for discovering the location where to get OCI artifacts for different services.

One example is how a service provider, like crossplane-service-provider, running inside the OpenCP platform discovers where to get the chart and image for crossplane from? The solution for it will be defined in this ADR.

## Current state

### Service Providers

Each Service Provider is deployed by creating a `ServiceProvider` resource where the OCI image URL of the provider itself is specified directly:

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

The `ProviderConfig` resource of a Service Provider defines which versions of the managed service are available. For each version, all OCI artifact URLs (Helm chart and container images) plus pull secrets for private registries must be specified manually:

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

When installing a Platform Service, the OCI image URL of the platform service controller itself is specified directly in the `PlatformService` resource:

```yaml
# From platform-service-gateway
apiVersion: openmcp.cloud/v1alpha1
kind: PlatformService
metadata:
  name: gateway
spec:
  image: ghcr.io/openmcp-project/images/platform-service-gateway:v0.1.0
```

A Platform Service may additionally expose a service-specific config resource where image URLs and Helm chart locations for its dependencies must be configured manually:

```yaml
# From platform-service-gateway — GatewayServiceConfig
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

## New solution

A central way, managed by the platform, to get the location of images from.

### Requirements

- multiple versions of an artifact must be storable
- the solution must be usable in local development
- pullsecrets for an artifact should be inherited

### Flows which needs to be supported

1. Give me all versions of artifact, e.g. `crossplane-chart`.
2. Give me the pull secrets for artifact `crossplane-chart` version `v1.10`
3. Different versions of an artifact can come from different registries.

## Scope

### In Scope

- we are only supporting OCI images/artifacts

### Out of Scope

## Proposal

### Artifacts

A new resource inside the `platform` cluster called `Artifact`.
One artifact will point to exactly one oci image.

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

The `metadata.name` of an Artifact is arbitrary.
They are intended to be fetched by their specfields using a `fieldSelector`.
<!-- TODO: Valentin -->

The `spec.version` parameter is not the same as the `tag` of the underlying oci image. The version is the version of the parent component, the user can select.
For example `crossplane` is a component, which consists of two `artifacts`, the `chart` and the `image`. So there will be two `Artifact` resources which will be called:

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

So they have different image `tags` but are listed under the same version. So a consuming entity can then easily knows I will use the chart with the tag `v1.20.0` and the image `v2.1.2` when a customer install the version `v1.20.0`.

![Discoverable Artifacts](./discoverable-artifacts.excalidraw.svg)

### ProviderConfig example

Every `ServiceProvider` has a `ProviderConfig` resource. As we need to tell the `ServiceProvider` how to get to the `Artifact`s we need to define this in the `ProviderConfig`.

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
