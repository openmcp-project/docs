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

In there `ProviderConfig` they have a definition for `availableVersions` where the oci url is defined.

When installing a Service Provider the image url is directly specified in the `ServiceProvider` resource.

### Platform Services

When installing a platform service the image url is directly specified in the `PlatformService` resource.

### Cluster Provider

When installing a cluster provider the image url is directly specified in the `ClusterProvider` resource.

## New solution

A central way, managed by the platform, to get the location of images from.

### Requirements

- multiple versions of an artifact must be storable
- the solution must be usable in local development
- pullsecrets for an artifact must

### Flows which needs to be supported

1. Give me all versions of artifact, e.g. `crossplane-chart`.
2. Give me the pull secrets for artifact `crossplane-chart` version `v1.10`
3. Different versions of an artifact can come from different registries.

## Scope

### In Scope

- we are only supporting OCI images/artifacts

### Out of Scope

## Proposal

A new resource inside the `platform` cluster called `Artifact`.
One artifact will point to exactly one oci image.

```yaml
kind: Artifact
metadata:
  name: crossplane-chart-v1.20.0
  labels:
    artifact.open-control-plane.io/name: crossplane-chart
    artifact.open-control-plane.io/version: v1.20.0
spec:
  name: crossplane-chart
  version: v1.20.0
  url: ghcr.io/crossplane/crossplane:v1.20.0@sha:23426...
  pullsecrets:
    - name:
      namespace:
```

The `metadata.name` of an Artifact is arbitrary.
They are intended to be fetched by their labels. For that we define two fixed labels:

```yaml
artifact.open-control-plane.io/name: # The name of artifact
artifact.open-control-plane.io/version: # the version of the artifact
```

When a service provider now wants to know which versions of an artifact are installable, they can fetch by the `artifact.open-control-plane.io/name`.

The `artifact.open-control-plane.io/version` is not the same as the `tag` of the underlying oci image. The version is the version of the component, the user can select.
For example `crossplane` is a component, which consists of two `artifacts`, the `chart` and the `image`. So there will be two `Artifact` resources which will be called:

```yaml
kind: Artifact
metadata:
  name: crossplane-image-v1.20.0
  labels:
    artifact.open-control-plane.io/name: crossplane-image
    artifact.open-control-plane.io/version: v1.20.0
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
  labels:
    artifact.open-control-plane.io/name: crossplane-chart
    artifact.open-control-plane.io/version: v1.20.0
spec:
  name: crossplane-chart
  version: v1.20.0
  url: ghcr.io/crossplane/crossplane-chart:v1.20.0@sha:23426...
  pullsecrets:
    - name:
      namespace:
```

So they have different image `tags` but are listed under the same version. So a consuming entity can then easily knows I will use the chart with the tag `v1.20.0` and the image `v2.1.2` when a customer install the version `v1.20.0`.

![](./discoverable-artifacts.excalidraw.svg)
