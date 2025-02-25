# Open MCP Landscape Overview

An MCP landscape consists of some fixed parts which exist in every landscape right from the beginning (after some bootstrapping process), and other parts which are dynamically added afterwards. The fixed parts are a cluster called the **platform cluster**, and on it the **OpenMCP Operator**, which consists of several controllers. 

Further operators can be added to the landscape. They are devided in three categories: 

- **Cluster Providers**, 
- **Platform Services** (for example the project-workspace operator),
- **Service Providers** (for example the crossplane provider and landscaper provider). 

Such operators are specified in custom resources of three kinds (`ClusterProvider`, `PlatformService`, `ServiceProvider`), and installed by three corresponding controllers, which are part of the OpenMCP Operator.

![Overview](./diagram-overview.png)


## Objectives

We purposefully tie providers with infrastructure resources (e.g. clusters). The reason for this is that we want to enable a flow where an enduser can order a provider and the mcp admin does not have to provision clusters manually, but rather they are created automatically by the cluster provider.


## Cluster Management

Further clusters can be added to an mcp landscape. Every cluster is specified in a `Cluster` resource. These resources are reconciled by cluster providers, which install and manage the actual clusters.


### Classes

A landscape can have more than one cluster provider. To determine which cluster provider is responsible for a cluster resource, each cluster resource has a `class` attribute. Each cluster provider is responsible one class. (No two cluster providers should be responsible for the same class, and for each class there should be a cluster provider.)


### Cluster Scheduler

Additional clusters can be needed for example in the following situations:

- to create the onboarding cluster of an mcp landscape,
- when the mcp operator reconciles an mcp resource created by a user,
- when a managed service (crossplane, landscaper, etc.) requires a workload cluster for an instance.

In these cases, the component that requires a cluster creates a `ClusterRequest` resource (rather than directly a `Cluster` resource). The reason is that not in all cases a new cluster must to be created. For example, several managed service instances can share a workload cluster; or in a dev scenario everything might run on one cluster. 

In a `ClusterRequest` one can specify requirements which the requested cluster should fulfill, for example cpu or memory requirements. 

The **cluster scheduler** (which is part of the OpenMCP Operator) is a controller, which reconciles the `ClusterRequest` resources. It tries to find an existing cluster that matches the requirements specified in the `ClusterRequest`. If there is no such cluster, it creates a new `Cluster` resource. The responsible cluster provider will then create that cluster.


### Purposes

Every `Cluster` resource has a `purpose` attribute. It is list, and the possible entries (`platform`, `onboarding`, `workload`, `mcp`) indicate for what purposes the cluster is used, namely as:

- **Platform cluster:** the cluster on which the OpenMCP Operator runs. Exists once per landscape.
- **Onboarding cluster:** the cluster on which a customer can create for example ManagedControlPlane (MCP) resources to get onboarded. Exists once per landscape.
- **Workload clusters:** clusters on which the instances of managed services run.
- **MCP clusters:** clusters on which users can create their crossplane, landscaper etc. resources.

A cluster can have multiple purposes, therefore it is a list (e.g. in a dev scenario a single cluster might play all roles). 

In a `ClusterRequest` one must specify for what purpose the requested cluster will be used. If the cluster scheduler reconciles the cluster request and selects a certain cluster, it adds this purpose to the purpose list of the cluster resource (if it is not yet there). 

When selecting a cluster, the cluster scheduler must follow certain rules. Possible rules might be: 

- If a workload cluster is requested, the selected cluster must have no other purposes than "workload".
- If an mcp cluster is requested, a new cluster must be created.

![diagram](./diagram-cluster-provider.png)
