---
sidebar_position: 3
id: providers
slug: /users/concepts/providers
---

# Plug & Play

Providers extend an OpenControlPlane environment with additional functionality. There are three distinct types, each operating at a different scope. All provider types are open for community contributions - if you have a use case not yet covered, [we'd love to hear from you](https://github.com/orgs/openmcp-project/discussions).

![Overview of provider types in OpenControlPlane](/img/provider_types.png)

## Service Providers

<img src="/img/platform/tower.png" alt="ServiceProvider" style={{maxWidth: '80px', float: 'right', marginLeft: '16px'}} />

Service Providers add functionality to individual **`ControlPlanes`** — examples include cloud provider APIs, GitOps tooling, policies, or backup and restore.

- **Platform Owners** install and configure which service providers are available in the environment.
- **End users** choose which of those providers to activate for their own `ControlPlane`.

**CRD Reference:** [ServiceProvider](/reference/operator/providers/serviceprovider) · [Available services](/reference/overview#service-providers)

**Developer guide:** [Build a Service Provider](/developers/serviceprovider/develop)

<div style={{clear: 'both'}} />

## Platform Services

<img src="/img/platform/main.png" alt="PlatformService" style={{maxWidth: '80px', float: 'right', marginLeft: '16px'}} />

Platform Services add functionality to the **OpenControlPlane environment as a whole** — not to individual `ControlPlanes`. Examples include network services (Gateway API, Ingress), audit logs, billing, and system-wide policies.

- **Platform Owners** install and configure platform services; they apply to the entire system.
- **End users** benefit from platform services automatically - there is nothing to activate or configure.

**CRD Reference:** [PlatformService](/reference/operator/providers/platformservice)

**Operator guide:** [Configure platform services](/developers/overview)

<div style={{clear: 'both'}} />

## Cluster Providers

<img src="/img/platform/hangar_gardener.png" alt="ClusterProvider" style={{maxWidth: '80px', float: 'right', marginLeft: '16px'}} />

Cluster Providers handle the dynamic creation, modification, and deletion of Kubernetes clusters. They abstract away specific cluster technologies (e.g., [Gardener](https://gardener.cloud/) and [Kubernetes-in-Docker](https://kind.sigs.k8s.io/)) behind a homogeneous interface.

- **Platform Owners** select and configure the cluster provider that matches their target infrastructure.
- **End users** are not exposed to this layer - cluster lifecycle is handled transparently when a `ControlPlane` is created or deleted.

**CRD Reference:** [ClusterProvider](/reference/operator/providers/clusterprovider)

**Developer guide:** [Build a Cluster Provider](/developers/overview)

<div style={{clear: 'both'}} />
