---
sidebar_position: 1
id: controlplane
---

# ControlPlanes

<img src="/img/cp2.png" alt="ControlPlane" style={{maxWidth: '200px'}} />

`ControlPlanes` are at the heart of OpenControlPlane. Simply put, they are lightweight Kubernetes clusters that store the desired state and current status of various resources. All resources follow the Kubernetes Resource Model (KRM), allowing infrastructure resources, deployments, etc., to be managed with common Kubernetes tools like kubectl, kustomize, Helm, Flux, ArgoCD, and so on.

- **End users** create and manage `ControlPlanes` to deploy their custom resources. → [Getting started](/users/getting-started)
- **Platform Owners** configure which services and cluster providers are available. → [Platform Owner guide](/operators/overview)

**CRD Reference:** [`ControlPlane`](/reference/core/controlplane)

## ControlPlane Lifecycle

This section shortly summarizes the usual lifecycle of a `ControlPlane`. For a more detailed explanation, take a look at [Getting started](/users/getting-started).

#### 1. ControlPlane Creation

The end-user creates a new `ControlPlane`. This results in a (mostly) empty kubernetes cluster that has RBAC resources (`ClusterRole`, `ClusterRoleBinding`, etc.) configured as specified in the `ControlPlane`.

#### 2. Service Installation

The end-user adds services to the `ControlPlane` by creating their corresponding [service resources](../getting-started/configure#prerequisites) next to the `ControlPlane`. Each service resource created this way causes the corresponding [ServiceProvider](providers#service-providers) to make that service available on the `ControlPlane`'s cluster.

#### 3. Service Usage

The end-user uses the installed services on the `ControlPlane` cluster by creating custom resources based on Custom Resource Definitions (CRDs).

#### 4. Service Removal

If a service is not required anymore, the end-user first needs to remove any usage of that service from his `ControlPlane`'s cluster, and then delete the service resource afterwards. The ServiceProvider will then uninstall the service.

##### 5. ControlPlane Deletion

By deleting the `ControlPlane` resource itself, the end-user also triggers the deletion of the corresponding kubernetes cluster. Removing the services beforehand is not required, but no service must be in use anymore on the cluster.
