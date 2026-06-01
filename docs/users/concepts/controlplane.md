---
sidebar_position: 1
id: controlplane
---

# ControlPlanes

<img src="/img/cp2.png" alt="ControlPlane" style={{maxWidth: '200px'}} />

ControlPlanes are at the heart of OpenControlPlane. Simply put, they are lightweight Kubernetes clusters that store the desired state and current status of various resources. All resources follow the Kubernetes Resource Model (KRM), allowing infrastructure resources, deployments, etc., to be managed with common Kubernetes tools like kubectl, kustomize, Helm, Flux, ArgoCD, and so on.

- **End users** create and manage ControlPlanes to deploy their workloads. → [Getting started](/users/getting-started)
- **Operators** configure which services and cluster providers are available. → [Operator guide](/operators/overview)

**CRD Reference:** [ManagedControlPlaneV2](/reference/core/controlplane)
