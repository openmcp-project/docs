# Getting Started

In this guide we will go through how to request a service instance via the onboarding cluster and consume it on the ManagedControlPlane cluster.

## Prerequisites

In order to get started, the first you will require is a kubeconfig pointing to your onboarding cluster. This is the cluster in which
users can create Projects, Workspaces and request MCP Cluster instances. Once this kubeconfig is acquired you can proceed with the rest of this guide.

Note, that normally, you will only have limited access to resources in the on-boarding cluster.
This means, you won't able to list existing resources of most kinds, but you will be able to create the resource that you will actually require.

## Setup

### 1. Create a `Project`

A `Project` is the starting point of your Manged Control Plane (MCP) journey. It is a logical grouping of `Workspaces` and `ManagedControlPlanes`. A `Project` can be used to represent an organization, department, team or any other logical grouping of resources.

_**Note**_, that in your organization certain `annotations` or `labels` might be required to be set in order to have a correct Workspace. Please contact your cluster administrator to find out more.
For example, certain SAP specific labels are as follows:
```yaml
labels:
    openmcp.cloud.sap/charging-target: "<replace>"
    openmcp.cloud.sap/charging-target-type: "<replace>"
```

The values for these are provided by your cluster administrator.

A normal project can look something like this:

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

To create it, run:

```
kubectl create -f project.yaml
```

_**Note**_: We are using `create` here for a reason. This goes for the rest of this guide.

Once the project reconciles, check the project status. It should contain a `namespace` section that the project generated.

To check the status, you should have access to list your specific project with:

```
$> kubectl describe project ocm-team

Name:         platform-team
Namespace:
... <redacted>
API Version:  core.openmcp.cloud/v1alpha1
Kind:         Project
Metadata:
  Creation Timestamp:  2026-03-10T12:02:37Z
  Finalizers:
    core.openmcp.cloud
  Generation:        1
  Resource Version:  140594720
  UID:               0566ecc4-72f0-4905-904c-cc609fcfc014
Spec:
  Members:
    Kind:  User
    Name:  <your user mail address>
    Roles:
      admin
    Kind:  User
    Name:  <any other user mail address>
    Roles:
      admin
Status:
  Namespace:  project-platform-team
Events:       <none>
```

### 2. Create a `Workspace` in the `Project`

A `Workspace` is a logical grouping of `ManagedControlPlanes`. A `Workspace` can be used to represent an environment (e.g. dev, staging, prod) or again an organization, department, team or any other logical grouping of resources.

The create a workspace you can use the following configuration:

```yaml
apiVersion: core.openmcp.cloud/v1alpha1
kind: Workspace
metadata:
  name: dev
  namespace: project-platform-team # This is retrieved from the Project status from above.
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

Note, that the namespace in which the Workspace lives in is from the Project created above. Create this workspace by running:

```
kubectl create -f workspace.yaml
```

The output of this object will also contain a namespace. That namespace is the specific namespace to use for your MCP cluster creation!

You inspect the resource by running the following command:

```
$> kubectl describe workspace dev -n project-platform-team

Name:         dev
Namespace:    project-platform-team
Labels:       <none>
Annotations:  core.openmcp.cloud/created-by: <your user mail address>
              openmcp.cloud/display-name: Platform Team - Dev
API Version:  core.openmcp.cloud/v1alpha1
Kind:         Workspace
Metadata:
  Creation Timestamp:  2026-03-10T12:02:51Z
  Finalizers:
    core.openmcp.cloud
  Generation:        1
  Resource Version:  140594791
  UID:               9d52be65-0c71-4ab4-85b4-dcf20e12fa7f
Spec:
  Members:
    Kind:  User
    Name:  <your user mail address>
    Roles:
      admin
    Kind:  User
    Name:  <any other user mail address>
    Roles:
      admin
Status:
  Namespace:  project-platform-team--ws-dev
Events:       <none>
```

Grab that namespace and continue with creating the ManagedControlPlane resource.

### 3. Create a `ManagedControlPlane` in the `Workspace`

The `ManagedControlPlane` resource is the heart of the openMCP platform. Each Managed Control Plane (MCP) has its own Kubernetes API endpoint and data store. You can use the `iam` property to define who should have access to the MCP and the resources it contains.

The create a ManagedControlPlane object create the following yaml:

_**Note**_: The name of this object is significant and will be used later. Choose carefully.

```yaml
apiVersion: core.openmcp.cloud/v2alpha1
kind: ManagedControlPlaneV2
metadata:
  name: mcp-01
  namespace: project-platform-team--ws-dev
spec:
  iam:
    oidc: # for human authentication
      defaultProvider:
        roleBindings: # authorization for human users
        - roleRefs:
          - kind: ClusterRole
            name: cluster-admin
          subjects:
          - kind: User
            name: first.user@example.com
          - kind: User
            name: second.user@example.com
    tokens: # for machine authentication
    - name: xyz-service-token
      roleRefs: # authorization for machine users
      - kind: ClusterRole
        name: cluster-admin
```

Under `spec.iam` you can define the authentication for your ManagedControlPlane. You can use OIDC-based authentication for human users and token-based authentication for machine users.
For authorization, ClusterRoleBindings will map the specified roles to the defined subjects. For token-based authentication, the specified roles will get bound to a generated ServiceAccount on the ManagedControlPlane.

Normally, you would only require one of these, so don't worry if one of them says failed to reconcile, while the other is `Ready`.

Once the cluster is successfully reconciled, in the status at `status.access` you will find the references to the secrets at the Onboarding API that contains the kubeconfig to access your MCP for the OIDC and/or token-based authentication methods.

On this cluster, your user is an Admin user. You should be able to have access to all the installed resources.

Next, is how you request an actual service to be present on your MCP cluster.

_**Note**_: If any of the needed resources to install a specific service provider do not exist on your onboarding cluster, ask your cluster administrator to install the required CRDs via a `ServiceProvider` resource.

Once the `ManageControlPlane` object reconciles, you should see something like this:

```
$> kubectl describe mcpv2 mcp-01 -n project-ocm-team--ws-canary

Name:         mcp-01
Namespace:    project-platform-team--ws-dev
Labels:       <none>
Annotations:  <none>
API Version:  core.openmcp.cloud/v2alpha1
Kind:         ManagedControlPlaneV2
Metadata:
  Creation Timestamp:  2026-03-13T09:36:31Z
  ...
Spec:
  Iam:
    Oidc:
      Default Provider:
        Role Bindings:
          Role Refs:
            Kind:  ClusterRole
            Name:  cluster-admin
          Subjects:
            Kind:  User
            Name:  first.user@example.com
            Kind:  User
            Name:  second.user@example.com
    Tokens:
      Name:  xyz-service-token
      Role Refs:
        Kind:  ClusterRole
        Name:  cluster-admin
Status:
  Access:
    oidc_openmcp:
      Name:  oidc-openmcp.mcp-01.kubeconfig
    token_xyz-service-token:
      Name:  token-xyz-service-token.mcp-01.kubeconfig
  Conditions:
    Last Transition Time:  2026-03-13T13:25:00Z
    Message:
    ...
```

Note the `status.access` resource under `oidc_openmcp`. This is the Secret you need to fetch in order to get your kubeconfig for the provisioned MCP cluster.

To fetch that value and put it into a file called `mcp-kubeconfig.yaml`, run the following command:

```
kubectl get secrets "$(kubectl get mcpv2 mcp-01 -n project-platform-team--ws-dev -o jsonpath='{.status.access.oidc_openmcp.name}')" -n project-platform-team--ws-dev -o jsonpath='{.data.kubeconfig}' | base64 -d > mcp-kubeconfig.yaml
```

### 4. Install managed services in your Managed Control Plane (MCP)

You can install managed services in your Managed Control Plane (MCP) to extend its functionality. Currently, the following managed services are available:
- Crossplane via the [service-provider-crossplane](https://github.com/openmcp-project/service-provider-crossplane)
- Landscaper via the [service-provider-landscaper](https://github.com/openmcp-project/service-provider-landscaper)
- OCM via the [service-provider-ocm](https://github.com/open-component-model/service-provider-ocm)

#### Prerequisites

In order to install any of the above offerings, their `ProviderConfig` object must exist in your onboarding cluster. Each service will have a specific `ProviderConfig` object that you
can get from the service provider's repository. Please contact your onboarding cluster administrator to install the necessary configurations and the `ServiceProvider` objects.

_**Note**_: For each of these providers the `name` of the managed service object _MUST_ match your MCP object's name. This is so that a single MCP cluster cannot have multiple installations of the same provider.

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

#### Managed Service: OCM

The Open Component Model (OCM) toolset helps you deliver and deploy your software securely anywhere, at any scale. It's an open standard that defines deliverable in components that then can be further
processed transferred and verified to any location regardless of the technology of storage.

To install its operator for your MCP cluster, you need to create an `OCM` resource in the same namespace and name as your `ManagedControlPlane` object.

```yaml
apiVersion: ocm.services.openmcp.cloud/v1alpha1
kind: OCM
metadata:
  name: mcp-01 # must match your MCP cluster so it will track the right cluster
  namespace: project-platform-team--ws-dev
spec:
  version: 0.2.0
```

Once this object reconciles, you should see something like this in its status:

```
# Make sure you are using the kubeconfig for that MCP cluster
$> kubectl describe pod -n ocm-k8s-toolkit-system ocm-k8s-toolkit-controller-manager-

Name:             ocm-k8s-toolkit-controller-manager-68b94b65bc-8ggv8
Namespace:        ocm-k8s-toolkit-system
Priority:         0
Service Account:  ocm-k8s-toolkit-controller-manager
...
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  56s   default-scheduler  Successfully assigned ocm-k8s-toolkit-system/ocm-k8s-toolkit-controller-manager-68b94b65bc-8ggv8 to ***
  Normal  Pulling    56s   kubelet            Pulling image "ghcr.io/open-component-model/kubernetes/controller:0.2.0@sha256:78ffe14f5175e3510f6dfb20df0a07eeb2de99ee24e56a0015dd941727b1c9e7"
  Normal  Pulled     53s   kubelet            Successfully pulled image "ghcr.io/open-component-model/kubernetes/controller:0.2.0@sha256:78ffe14f5175e3510f6dfb20df0a07eeb2de99ee24e56a0015dd941727b1c9e7" in 2.718s (2.718s including waiting). Image size: 34158077 bytes.
  Normal  Created    53s   kubelet            Created container: manager
  Normal  Started    53s   kubelet            Started container manager
```

The base ocm installation comes with a bare minimum set of RBAC settings. To extend this, simply follow our guide here: [custom RBAC for OCM](https://github.com/open-component-model/open-component-model/blob/main/kubernetes/controller/docs/getting-started/custom-rbac.md).

Since you are an admin on the MCP cluster, extending the service account's RBAC should work.