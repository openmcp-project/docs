# Getting Started

> This is a quick guide on how to get started with the openMCP platform. This guide is not complete and will be extended in the future.

## Setup

### 1. Create a `Project`
A `Project` is the starting point of your Manged Control Plane (MCP) journey. It is a logical grouping of `Workspaces` and `ManagedControlPlanes`. A `Project` can be used to represent an organization, department, team or any other logical grouping of resources.
```yaml
apiVersion: core.openmcp.cloud/v1alpha1
kind: Project
metadata:
  name: platform-team
  annotations:
    openmcp.cloud/display-name: Platform Team
spec:
  members:
    - kind: User
      name: first.user@example.com
      roles:
        - admin
    - kind: User
      name: second.user@example.com
      roles:
        - view
```

### 2. Create a `Workspace` in the `Project`

A `Workspace` is a logical grouping of `ManagedControlPlanes`. A `Workspace` can be used to represent an environment (e.g. dev, staging, prod) or again an organization, department, team or any other logical grouping of resources.

```yaml
apiVersion: core.openmcp.cloud/v1alpha1
kind: Workspace
metadata:
  name: dev
  namespace: project-platform-team
  annotations:
    openmcp.cloud/display-name: Platform Team - Dev
spec:
  members:
    - kind: User
      name: first.user@example.com
      roles:
        - admin
    - kind: User
      name: second.user@example.com
      roles:
        - view
```

### 3. Create a `ManagedControlPlane` in the `Workspace`

The `ManagedControlPlane` resource is the heart of the openMCP platform. Each Managed Control Plane (MCP) has its own Kubernetes API endpoint and data store. You can use the `iam` property to define who should have access to the MCP and the resources it contains.

```yaml
apiVersion: core.openmcp.cloud/v2alpha1
kind: ManagedControlPlaneV2
metadata:
  name: mcp-01
  namespace: project-platform-team--ws-dev
spec:
  iam:
    roleBindings:
    - subjects:
      - kind: User
        name: first.user@example.com
      - kind: User
        name: second.user@example.com
      roleRefs:
      - kind: ClusterRole
        name: cluster-admin
```

### 4. Install managed services in your Managed Control Plane (MCP)

You can install managed services in your Managed Control Plane (MCP) to extend its functionality. Currently, the following managed services are available:
- Crossplane via the [service-provider-crossplane](https://github.com/openmcp-project/service-provider-crossplane)
- Landscaper via the [service-provider-landscaper](https://github.com/openmcp-project/service-provider-landscaper)

#### Managed Service: Crossplane

Crossplane is an open source project that enables you to manage cloud infrastructure and services using Kubernetes-style declarative configuration. It allows you to define and manage cloud resources such as databases, storage, and networking using Kubernetes manifests.

To install Crossplane in your MCP, you need to create a `Crossplane` resource in the same namespace as your `ManagedControlPlane`. The following example installs Crossplane version `v1.20.0` with the `provider-kubernetes` provider version `v0.16.0`.

```yaml
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: Crossplane
metadata:
  name: mcp-01 # Same name as your ManagedControlPlane
  namespace: project-platform-team--ws-dev # Same namespace as your ManagedControlPlane
spec:
  version: v1.20.0
  providers:
    - name: provider-kubernetes
      version: v0.16.0
```

#### Managed Service: Landscaper

Landscaper manages the installation, updates, and uninstallation of cloud-native workloads, with focus on larger complexities, while being capable of handling complex dependency chains between the individual components.

To install a Landscaper for your MCP, you need to create a `Landscaper` resource with the same namespace and name as your `ManagedControlPlane`. The following example installs the Landscaper with default configuration.

```yaml
apiVersion: landscaper.services.openmcp.cloud/v1alpha2
kind: Landscaper
metadata:
  name: mcp-01 # Same name as your ManagedControlPlane
  namespace: project-platform-team--ws-dev # Same namespace as your ManagedControlPlane
spec: 
  version: v0.142.0
```
