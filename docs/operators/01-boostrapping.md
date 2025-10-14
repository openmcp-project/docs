import Tabs from '@theme/Tabs';
import CodeBlock from '@theme/CodeBlock';
import TabItem from '@theme/TabItem';

# openMCP Landscape Bootstrapping

To set up and and manage openMCP landscapes, a concept named bootstrapping is used.
Bootstrapping works for creating new landscapes as well as updating existing landscapes with new versions of openMCP.
The bootstrapping involves the creation of a GitOps process where the desired state of the landscape is stored in a Git repository and is being synced to the actual landscape using FluxCD.
The operator of a landscape can configure the bootstrapping to their liking by providing a bootstrapping configuration that controls the configuration of the openmcp-operator including all desired cluster-providers, service-providers, and platform services.
The bootstrapping is performed by the `openmcp-bootstrapper` command line tool (https://github.com/openmcp-project/bootstrapper).

## General Bootstrapping Architecture

```mermaid
flowchart TD
    subgraph OCI Registry
        A[openMCP Root OCM Component]
        B[openmcp-operator] --> A
        C[Cluster Provider] --> A
        D[Service Provider] --> A
        E[Platform Service] --> A
        F[GitOps Templates] --> A
    end

    subgraph GitRepo[Git Repository]
        G[Kustomization]
    end

    subgraph Target Kubernetes Cluster
        H[GitSource]
        I[Kustomization]
        I --> G
    end

    subgraph openmcp-bootstrapper
        J[Bootstrapper CLI]
        J --> A
        J --> G
        J --> H
        J --> I
    end

    H --> GitRepo
```

The `openMCP Root OCM Component` (github.com/openmcp-project/openmcp) contains references to the `openmcp-operator`, the `gitops-templates` (github.com/openmcp-project/gitops-templates) as well as a list of cluster providers, service providers and platform services that can be deployed.
The `openMCP Root OCM Component` acts as the source of the available versions, image locations and deployment configuration of an openMCP landscape.

The `Git Repository` contains the desired state of the openMCP landscape. The desired state is encoded in a set of Kubernetes manifests that are organized and templated using Kustomize. The `Git Repository` is being updated by the `openmcp-bootstrapper` CLI tool for the information provided in the `openMCP Root OCM Component` as well as the bootstrapping configuration provided by the operator.

The `openmcp-bootstrapper` reads the `openMCP Root OCM Component` from an OCI registry to retrieve the `GitOps Templates` as well as the image locations of the FluxCD tool, the `openmcp-operator`, the cluster providers, the service providers and the platform services. The templated `GitOpsTemplate` is applied to the `Git Repository` and the templated FluxCD deployment is applied to the `Target Kubernetes Cluster`. The `openmcp-bootstrapper` also creates a FluxCD `GitSource` based on the provided Git repository URL and credentials.
The `openmcp-bootstrapper` then creates a FluxCD `Kustomizations` that points to the `Git Repository` and applies it to the `Target Kubernetes Cluster`.

### Prerequisites

* A target Kubernetes cluster that matches the desired cluster provider being used (e.g. `Kind` for local testing, `Gardener` for Gardener Shoots)
* A Git repository that will be used to store the desired state of the openMCP landscape
* An OCI registry that contains the `openMCP Root OCM Component` (e.g. `ghcr.io/openmcp-project`)

:::info
The Git repository used in the following examples must exist before running the `openmcp-bootstrapper` CLI tool. The `openmcp-bootstrapper` is using the default branch (like `main`) as a source to create the desired branch.
The default branch may not be empty, but it should not contain any files or folders that would conflict with the files and folders created by the `openmcp-bootstrapper`. A recommendation is to create an empty repository with a  `README.md` file.
:::

#### Download the `openmcp-bootstrapper` CLI tool

The `openmcp-bootstrapper` CLI tool can be downloaded as an OCI image from an OCI registry (e.g. `ghcr.io/openmcp-project`).
In this example docker will be used to run the `openmcp-bootstrapper` CLI tool. If you don't use docker, adjust the command accordingly.

Retrieve the latest version of the `openmcp-bootstrapper`:

```shell
TAG=$(curl -s "https://api.github.com/repos/openmcp-project/bootstrapper/releases/latest" | grep '"tag_name":' | cut -d'"' -f4)
export OPENMCP_BOOTSTRAPPER_VERSION="${TAG}"
```

Pull the latest version of the `openmcp-bootstrapper`:

```shell
docker pull ghcr.io/openmcp-project/images/openmcp-bootstrapper:${OPENMCP_BOOTSTRAPPER_VERSION}
```

## Example using the Kind Cluster Provider

### Requirements

* [Docker](https://docs.docker.com/get-docker/) installed and running. Docker alternatively can be replaced with another OCI runtime (e.g. Podman) that can run the `openmcp-bootstrapper` CLI tool as an OCI image. 
* [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/) installed

:::info
If you are using a docker alternative, make sure that it is correctly setup regarding Docker compatibility. In case of Podman, you should find a corresponding configuration under `Settings` in the Podman UI.
:::

### Create a configuration folder

Create a directory that will be used to store the configuration files and the kubeconfig files.
To keep this example simple, we will use a single directory named `config` in the current working directory.

```shell
mkdir config
```

All following examples will use the `config` directory as the configuration directory. If you use a different directory, replace all occurrences of `config` with your desired directory path.

Create a directory named `kubeconfigs` in the configuration folder to store the kubeconfig files of the created clusters.

```shell
mkdir kubeconfigs
```

### Create the Kind configuration file (kind-config.yaml) in the configuration folder

```yaml
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
- role: control-plane
  extraMounts:
  - hostPath: /var/run/docker.sock
    containerPath: /var/run/host-docker.sock
```

### Create the Kind cluster

Create the Kind cluster using the configuration file created in the previous step.

:::info

In case you are using Podman instead of Docker, it is currently required to first create a suitable network for the Kind cluster by executing the following command before creating the Kind cluster itself.

```shell
podman network create kind --subnet 172.19.0.0/16
```

:::

```shell
kind create cluster --name platform --config ./config/kind-config.yaml
```

Export the internal kubeconfig of the Kind cluster to a file named `platform-int.kubeconfig` in the configuration folder.

```shell
kind get kubeconfig --internal --name platform > ./kubeconfigs/platform-int.kubeconfig
```

### Create a bootstrapping configuration file (bootstrapper-config.yaml) in the configuration folder

Replace `<your-org>` and `<your-repo>` with your Git organization and repository name.
The environment can be set to the logical environment name (e.g. `dev`, `prod`, `live-eu-west`) that will be used in the Git repository to separate different environments.
The branch can be set to the desired branch name in the Git repository that will be used to store the desired state of the openMCP landscape.

Get the latest version of the `github.com/openmcp-project/openmcp` root component:

```shell
TAG=$(curl -s "https://api.github.com/repos/openmcp-project/openmcp/releases/latest" | grep '"tag_name":' | cut -d'"' -f4)
echo "${TAG}"
```

In the bootstrapper configuration, replace `<openmcp-component-version>` with the latest version of the `github.com/openmcp/openmcp` root component:

```yaml title="config/bootstrapper-config.yaml"
component:
  location: ghcr.io/openmcp-project/components//github.com/openmcp-project/openmcp:<openmcp-component-version>

repository:
  url: https://github.com/<your-org>/<your-repo>
  branch: <branch-name>

environment: <environment-name>

openmcpOperator:
  config: {}
```

### Create a Git configuration file (git-config.yaml) in the configuration folder

For GitHub use a personal access token with `repo` write permissions.
It is also possible to use a fine-grained token. In this case, it requires read and write permissions for `Contents`.
```yaml title="config/git-config.yaml"
auth:
  basic:
    username: "<your-git-username>"
    password: "<your-git-token>"
```

### Run the `openmcp-bootstrapper` CLI tool and deploy FluxCD to the Kind cluster

```shell
docker run --rm --network kind -v ./config:/config -v ./kubeconfigs:/kubeconfigs ghcr.io/openmcp-project/images/openmcp-bootstrapper:${OPENMCP_BOOTSTRAPPER_VERSION} deploy-flux --git-config /config/git-config.yaml --kubeconfig /kubeconfigs/platform-int.kubeconfig /config/bootstrapper-config.yaml
```

You should see output similar to the following:

```shell
Info: Starting deployment of Flux controllers with config file: /config/bootstrapper-config.yaml.
Info: Ensure namespace flux-system exists
Info: Creating/updating git credentials secret flux-system/git
Info: Created/updated git credentials secret flux-system/git
Info: Creating working directory for gitops-templates
Info: Downloading templates
/tmp/openmcp.cloud.bootstrapper-3041773446/download: 9 file(s) with 691073 byte(s) written
Info: Arranging template files
Info: Arranged template files
Info: Applying templates from gitops-templates/fluxcd to deployment repository
Info: Kustomizing files in directory: /tmp/openmcp.cloud.bootstrapper-3041773446/repo/envs/dev/fluxcd
Info: Applying flux deployment objects
Info: Deployment of flux controllers completed
```

### Inspect the deployed FluxCD controllers and Kustomization

Load the kubeconfig of the Kind cluster and check the deployed FluxCD controllers and the created GitRepository and Kustomization.

```shell
kind get kubeconfig --name platform > ./kubeconfigs/platform.kubeconfig
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get pods -n flux-system
```

You should see output similar to the following:

```shell
NAME                                           READY   STATUS    RESTARTS   AGE
helm-controller-648cdbf8d8-8jhnf               1/1     Running   0          9m37s
image-automation-controller-56df4c78dc-qwmfm   1/1     Running   0          9m35s
image-reflector-controller-56f69fcdc9-pgcgx    1/1     Running   0          9m35s
kustomize-controller-b4c4dcdc8-g49gc           1/1     Running   0          9m38s
notification-controller-59d754d599-w7fjp       1/1     Running   0          9m36s
source-controller-6b45b6464f-jbgb6             1/1     Running   0          9m38
```

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get gitrepositories.source.toolkit.fluxcd.io -A
````

You should see output similar to the following:

```shell
NAMESPACE     NAME           URL                                         AGE   READY   STATUS
flux-system   environments   https://github.com/<your-org>/<your-repo>   86s   False   failed to checkout and determine revision: unable to clone 'https://github.com/<your-org>/<your-repo>': couldn't find remote ref "refs/heads/<branch-name>"
```

This error is expected as the branch does not exist yet in the Git repository. The `openmcp-bootstrapper` will create the branch in the next step.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get kustomizations.kustomize.toolkit.fluxcd.io -A
```

You should see output similar to the following:

```shell
NAMESPACE     NAME          AGE     READY   STATUS
flux-system   flux-system   3m15s   False   Source artifact not found, retrying in 30s
```

This error is also expected as the GitRepository does not exist yet. The `openmcp-bootstrapper` will create the GitRepository in the next step.

### Run the `openmcp-bootstrapper` CLI tool to deploy openMCP to the Kind cluster

Update the bootstrapping configuration file (bootstrapper-config.yaml) to include the kind cluster provider and the openmcp-operator configuration.

```yaml title="config/bootstrapper-config.yaml"
component:
  location: ghcr.io/openmcp-project/components//github.com/openmcp-project/openmcp:<openmcp-component-version>

repository:
  url: https://github.com/<your-org>/<your-repo>
  branch: <branch-name>

environment: <environment-name>

providers:
  clusterProviders:
  - name: kind
    config:
      extraVolumeMounts:
        - mountPath: /var/run/docker.sock
          name: docker
      extraVolumes:
        - name: docker
          hostPath:
            path: /var/run/host-docker.sock
            type: Socket

openmcpOperator:
  config:
    managedControlPlane:
      mcpClusterPurpose: mcp-worker
      reconcileMCPEveryXDays: 7
    scheduler:
      scope: Cluster
      purposeMappings:
        mcp:
          template:
            spec:
              profile: kind
              tenancy: Exclusive
        mcp-worker:
          template:
            spec:
              profile: kind
              tenancy: Exclusive
        platform:
          template:
            metadata:
              labels:
                clusters.openmcp.cloud/delete-without-requests: "false"
            spec:
              profile: kind
              tenancy: Shared
        onboarding:
          template:
            metadata:
              labels:
                clusters.openmcp.cloud/delete-without-requests: "false"
            spec:
              profile: kind
              tenancy: Shared
        workload:
          tenancyCount: 20
          template:
            spec:
              profile: kind
              tenancy: Shared
```

```shell
docker run --rm --network kind -v ./config:/config -v ./kubeconfigs:/kubeconfigs ghcr.io/openmcp-project/images/openmcp-bootstrapper:${OPENMCP_BOOTSTRAPPER_VERSION} manage-deployment-repo --git-config /config/git-config.yaml --kubeconfig /kubeconfigs/platform-int.kubeconfig /config/bootstrapper-config.yaml
```

You should see output similar to the following:

```shell
Info: Downloading component ghcr.io/openmcp-project/components//github.com/openmcp-project/openmcp:v0.0.20
Info: Creating template transformer
Info: Downloading template resources
/tmp/openmcp.cloud.bootstrapper-2402093624/transformer/download/fluxcd: 9 file(s) with 691073 byte(s) written
/tmp/openmcp.cloud.bootstrapper-2402093624/transformer/download/openmcp: 8 file(s) with 6625 byte(s) written
Info: Transforming templates into deployment repository structure
Info: Fetching openmcp-operator component version
Info: Cloning deployment repository https://github.com/reshnm/template-test
Info: Checking out or creating branch kind
Info: Applying templates from "gitops-templates/fluxcd"/"gitops-templates/openmcp" to deployment repository
Info: Templating providers: clusterProviders=[{kind [123 34 101 120 116 114 97 86 111 108 117 109 101 77 111 117 110 116 115 34 58 91 123 34 109 111 117 110 116 80 97 116 104 34 58 34 47 118 97 114 47 114 117 110 47 100 111 99 107 101 114 46 115 111 99 107 34 44 34 110 97 109 101 34 58 34 100 111 99 107 101 114 34 125 93 44 34 101 120 116 114 97 86 111 108 117 109 101 115 34 58 91 123 34 104 111 115 116 80 97 116 104 34 58 123 34 112 97 116 104 34 58 34 47 118 97 114 47 114 117 110 47 104 111 115 116 45 100 111 99 107 101 114 46 115 111 99 107 34 44 34 116 121 112 101 34 58 34 83 111 99 107 101 116 34 125 44 34 110 97 109 101 34 58 34 100 111 99 107 101 114 34 125 93 44 34 118 101 114 98 111 115 105 116 121 34 58 34 100 101 98 117 103 34 125] map[extraVolumeMounts:[map[mountPath:/var/run/docker.sock name:docker]] extraVolumes:[map[hostPath:map[path:/var/run/host-docker.sock type:Socket] name:docker]] verbosity:debug]}], serviceProviders=[], platformServices=[], imagePullSecrets=[]
Info: Applying Custom Resource Definitions to deployment repository
/tmp/openmcp.cloud.bootstrapper-2402093624/repo/resources/openmcp/crds: 8 file(s) with 475468 byte(s) written
/tmp/openmcp.cloud.bootstrapper-2402093624/repo/resources/openmcp/crds: 1 file(s) with 1843 byte(s) written
Info: No extra manifest directory specified, skipping
Info: Committing and pushing changes to deployment repository
Info: Created commit: 287f9e88b905371bba412b5d0286ad02db0f4aac
Info: Running kustomize on /tmp/openmcp.cloud.bootstrapper-2402093624/repo/envs/dev
Info: Applying Kustomization manifest: default/bootstrap

```

### Inspect the Git repository

The desired state of the openMCP landscape has now been created in the Git repository and should look similar to the following structure:

```shell
.
├── envs
│   └── dev
│       ├── fluxcd
│       │   ├── flux-kustomization.yaml
│       │   ├── gitrepo.yaml
│       │   └── kustomization.yaml
│       ├── kustomization.yaml
│       ├── openmcp
│       │   ├── config
│       │   │   └── openmcp-operator-config.yaml
│       │   └── kustomization.yaml
│       └── root-kustomization.yaml
└── resources
    ├── fluxcd
    │   ├── components.yaml
    │   ├── flux-kustomization.yaml
    │   ├── gitrepo.yaml
    │   └── kustomization.yaml
    ├── kustomization.yaml
    ├── openmcp
    │   ├── cluster-providers
    │   │   └── kind.yaml
    │   ├── crds
    │   │   ├── clusters.openmcp.cloud_accessrequests.yaml
    │   │   ├── clusters.openmcp.cloud_clusterprofiles.yaml
    │   │   ├── clusters.openmcp.cloud_clusterrequests.yaml
    │   │   ├── clusters.openmcp.cloud_clusters.yaml
    │   │   ├── kind.clusters.openmcp.cloud_providerconfigs.yaml
    │   │   ├── openmcp.cloud_clusterproviders.yaml
    │   │   ├── openmcp.cloud_platformservices.yaml
    │   │   └── openmcp.cloud_serviceproviders.yaml
    │   ├── deployment.yaml
    │   ├── kustomization.yaml
    │   ├── namespace.yaml
    │   └── rbac.yaml
    └── root-kustomization.yaml
```

The `envs/<environment-name>` folder contains the Kustomization files that are used by FluxCD to deploy openMCP to the Kind cluster.
The `resources` folder contains the base resources that are used by the Kustomization files in the `envs/<environment-name>` folder.

## Inspect the Kustomizations in the Kind cluster

Force an update of the GitRepository and Kustomization in the Kind cluster to pick up the changes made in the Git repository.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig -n flux-system annotate gitrepository environments reconcile.fluxcd.io/requestedAt="$(date +%s)"
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig -n flux-system patch kustomization flux-system --type merge -p '{"spec":{"force":true}}'
```

Get the status of the GitRepository in the Kind cluster.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get gitrepositories.source.toolkit.fluxcd.io -A
```

You should see output similar to the following:

```shell
NAMESPACE     NAME           URL                                          AGE    READY   STATUS
flux-system   environments   https://github.com/<your-ourg>/<your-repo>   9m6s   True    stored artifact for revision 'docs@sha1:...'
```
So we have now successfully configured FluxCD to watch for changes in the specified GitHub repository, using the `environments` custom resource of kind `GitRepository`.
Now let's get the status of the Kustomization in the Kind cluster.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get kustomizations.kustomize.toolkit.fluxcd.io -A
```

You should see output similar to the following:

```shell
NAMESPACE     NAME          AGE   READY   STATUS
default       bootstrap     5m31s   True    Applied revision: docs@sha1:...
flux-system   flux-system   10m     True    Applied revision: docs@sha1:...
```

You can see that there are now two Kustomizations in the Kind cluster.
The `flux-system` Kustomization is used to deploy the FluxCD controllers and the `bootstrap` Kustomization is used to deploy openMCP to the Kind cluster.

### Inspect the deployed openMCP components in the Kind cluster

Now check the deployed openMCP components.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get pods -n openmcp-system
```

You should see output similar to the following:

```shell
NAME                                      READY   STATUS      RESTARTS   AGE
cp-kind-6b4886b7cf-z54pg                  1/1     Running     0          20s
cp-kind-init-msqg7                        0/1     Completed   0          27s
openmcp-operator-5f784f47d7-nfg65         1/1     Running     0          34s
ps-managedcontrolplane-668c99c97c-9jltx   1/1     Running     0          4s
ps-managedcontrolplane-init-49rx2         0/1     Completed   0          27s
```

So now, the openmcp-operator, the managedcontrolplane platform service and the cluster provider kind are running.
You are now ready to create and manage clusters using openMCP.

### Get Access to the Onboarding Cluster

The openmcp-operator should now have created a `onboarding Cluster` resource on the platform cluster that represents the onboarding cluster.
The onboarding cluster is a special cluster that is used to create new managed control planes. 

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get clusters.clusters.openmcp.cloud -A
```

You should see output similar to the following:

```shell
NAMESPACE        NAME         PURPOSES         PHASE   VERSION   PROVIDER   AGE
openmcp-system   onboarding   ["onboarding"]   Ready                        11m
```

Now you can retrieve the kubeconfig of the onboarding cluster.
Use `kind` to retrieve the list of available clusters.

```shell
kind get clusters
```

You should see output similar to the following:

```shell
onboarding.12345678
platform
```

You can now see the new onboarding cluster.
Get the kubeconfig of the onboarding cluster and save it to a file named `onboarding.kubeconfig` in the configuration folder.
Please replace `onboarding.12345678` with the actual name of your onboarding cluster.

```shell
kind get kubeconfig --name onboarding.12345678 > ./kubeconfigs/onboarding.kubeconfig
```

### Create a Managed Control Plane

Create a file named `my-mcp.yaml` with the following content in the configuration folder:

```yaml title="config/my-mcp.yaml"
apiVersion: core.openmcp.cloud/v2alpha1
kind: ManagedControlPlaneV2
metadata:
  name: my-mcp
  namespace: default
spec:
    iam: {}
```

Apply the file to the onboarding cluster:

```shell
kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig apply -f ./config/my-mcp.yaml
```

The openmcp-operator should start to create the necessary resources in order to create the managed control plane. As a result, a new `Managed Control Plane` should be available soon.
You can check the status of the Managed Control Plane using the following command:

```shell
kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig get managedcontrolplanev2 -n default my-mcp -o yaml
```

You should see output similar to the following:

```yaml
apiVersion: core.openmcp.cloud/v2alpha1
kind: ManagedControlPlaneV2
metadata:
  finalizers:
  - core.openmcp.cloud/mcp
  - request.clusters.openmcp.cloud/sample
  name: sample
  namespace: default
spec:
  iam: {}
status:
  conditions:
  - lastTransitionTime: "2025-09-16T13:03:55Z"
    message: All accesses are ready
    observedGeneration: 1
    reason: AllAccessReady_True
    status: "True"
    type: AllAccessReady
  - lastTransitionTime: "2025-09-16T13:03:55Z"
    message: Cluster conditions have been synced to MCP
    observedGeneration: 1
    reason: ClusterConditionsSynced_True
    status: "True"
    type: ClusterConditionsSynced
  - lastTransitionTime: "2025-09-16T13:03:55Z"
    message: ClusterRequest is ready
    observedGeneration: 1
    reason: ClusterRequestReady_True
    status: "True"
    type: ClusterRequestReady
  - lastTransitionTime: "2025-09-16T13:03:50Z"
    message: ""
    observedGeneration: 1
    reason: Meta_True
    status: "True"
    type: Meta
  observedGeneration: 1
  phase: Ready
```

You should see that the Managed Control Plane is in phase `Ready`.
The openmcp-operator should now have created a new Kind cluster that represents the Managed Control Plane.
You can check the list of available Kind clusters using the following command:

```shell
kind get clusters
```

You should see output similar to the following:

```shell
mcp-worker-abcde.87654321
onboarding.12345678
platform
```

You can now get the kubeconfig of the managed control plane and save it to a file named `my-mcp.kubeconfig` in the kubeconfigs folder. Please replace `mcp-worker-abcde.87654321` with the actual name of your managed control plane cluster.

```shell
kind get kubeconfig --name mcp-worker-abcde.87654321 > ./kubeconfigs/my-mcp.kubeconfig
```

You can now use the kubeconfig to access the Managed Control Plane cluster.

```shell
kubectl --kubeconfig ./kubeconfigs/my-mcp.kubeconfig get namespaces
```

### Deploy the Crossplane Service Provider

Update the bootstrapping configuration file (bootstrapper-config.yaml) to include the crossplane service provider.

```yaml title="config/bootstrapper-config.yaml"
component:
  location: ghcr.io/openmcp-project/components//github.com/openmcp-project/openmcp:<openmcp-component-version>

repository:
  url: https://github.com/<your-org>/<your-repo>
  branch: <branch-name>

environment: <environment-name>

providers:
  clusterProviders:
  - name: kind
    config:
      extraVolumeMounts:
        - mountPath: /var/run/docker.sock
          name: docker
      extraVolumes:
        - name: docker
          hostPath:
            path: /var/run/host-docker.sock
            type: Socket
  serviceProviders:
  - name: crossplane

openmcpOperator:
  config:
    managedControlPlane:
      mcpClusterPurpose: mcp-worker
      reconcileMCPEveryXDays: 7
    scheduler:
      scope: Cluster
      purposeMappings:
        mcp:
          template:
            spec:
              profile: kind
              tenancy: Exclusive
        mcp-worker:
          template:
            spec:
              profile: kind
              tenancy: Exclusive
        platform:
          template:
            metadata:
              labels:
                clusters.openmcp.cloud/delete-without-requests: "false"
            spec:
              profile: kind
              tenancy: Shared
        onboarding:
          template:
            metadata:
              labels:
                clusters.openmcp.cloud/delete-without-requests: "false"
            spec:
              profile: kind
              tenancy: Shared
        workload:
          tenancyCount: 20
          template:
            spec:
              profile: kind
              tenancy: Shared
```

Create a new folder named `extra-manifests` in the configuration folder. Then create a file named `crossplane-provider.yaml` with the following content, and save it in the new `extra-manifests` folder.

```yaml title="config/extra-manifests/crossplane-provider.yaml"
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: default
spec:
  chart:
    repository: "https://charts.crossplane.io/stable"
    name: crossplane
    availableVersions:
      - v1.20.0
      - v1.19.0
  availableProviders:
    - name: provider-kubernetes
      package: xpkg.upbound.io/upbound/provider-kubernetes
      versions:
        - v0.16.0
```

Run the `openmcp-bootstrapper` CLI tool to update the Git repository and deploy the crossplane service provider to the Kind cluster.

```shell
docker run --rm --network kind -v ./config:/config -v ./kubeconfigs:/kubeconfigs ghcr.io/openmcp-project/images/openmcp-bootstrapper:${OPENMCP_BOOTSTRAPPER_VERSION} manage-deployment-repo --git-config /config/git-config.yaml --kubeconfig /kubeconfigs/platform-int.kubeconfig --extra-manifest-dir /config/extra-manifests /config/bootstrapper-config.yaml
```

See the `--extra-manifest-dir` parameter that points to the folder containing the extra manifest file created in the previous step. All manifest files in this folder will be added to the Kustomization used by FluxCD to deploy openMCP to the Kind cluster.

The git repository should now be updated:

```shell
.
├── envs
│   └── dev
│       ├── fluxcd
│       │   ├── flux-kustomization.yaml
│       │   ├── gitrepo.yaml
│       │   └── kustomization.yaml
│       ├── kustomization.yaml
│       ├── openmcp
│       │   ├── config
│       │   │   └── openmcp-operator-config.yaml
│       │   └── kustomization.yaml
│       └── root-kustomization.yaml
└── resources
    ├── fluxcd
    │   ├── components.yaml
    │   ├── flux-kustomization.yaml
    │   ├── gitrepo.yaml
    │   └── kustomization.yaml
    ├── kustomization.yaml
    ├── openmcp
    │   ├── cluster-providers
    │   │   └── kind.yaml
    │   ├── crds
    │   │   ├── clusters.openmcp.cloud_accessrequests.yaml
    │   │   ├── clusters.openmcp.cloud_clusterprofiles.yaml
    │   │   ├── clusters.openmcp.cloud_clusterrequests.yaml
    │   │   ├── clusters.openmcp.cloud_clusters.yaml
    │   │   ├── crossplane.services.openmcp.cloud_providerconfigs.yaml
    │   │   ├── kind.clusters.openmcp.cloud_providerconfigs.yaml
    │   │   ├── openmcp.cloud_clusterproviders.yaml
    │   │   ├── openmcp.cloud_platformservices.yaml
    │   │   └── openmcp.cloud_serviceproviders.yaml
    │   ├── deployment.yaml
    │   ├── extra
    │   │   └── crossplane-providers.yaml
    │   ├── kustomization.yaml
    │   ├── namespace.yaml
    │   ├── rbac.yaml
    │   └── service-providers
    │       └── crossplane.yaml
    └── root-kustomization.yaml
```

After a while, the Kustomization in the Kind cluster should be updated and the crossplane service provider should be deployed:
You can force an update of the Kustomization in the Kind cluster to pick up the changes made in the Git repository.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig -n flux-system annotate gitrepository environments reconcile.fluxcd.io/requestedAt="$(date +%s)"
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig -n default patch kustomization bootstrap --type merge -p '{"spec":{"force":true}}'
```

List the pods in the `openmcp-system` namespace again:

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get pods -n openmcp-system
````

You should see output similar to the following:

```shell
NAME                                      READY   STATUS      RESTARTS   AGE
cp-kind-6b4886b7cf-z54pg                  1/1     Running     0          18m
cp-kind-init-msqg7                        0/1     Completed   0          18m
openmcp-operator-5f784f47d7-nfg65         1/1     Running     0          18m
ps-managedcontrolplane-668c99c97c-9jltx   1/1     Running     0          18m
ps-managedcontrolplane-init-49rx2         0/1     Completed   0          18m
sp-crossplane-6b8cccc775-9hx98            1/1     Running     0          105s
sp-crossplane-init-6hvf4                  0/1     Completed   0          2m11s
```

You should see that the crossplane service provider is running. This means that from now on, the openMCP is able to provide Crossplane service instances, using the new service provider Crossplane.

### Create a Crossplane service instance on the onboarding cluster

Create a file named `crossplane-instance.yaml` with the following content in the configuration folder:

```yaml title="config/crossplane-instance.yaml"
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: Crossplane
metadata:
  name: my-mcp
  namespace: default
spec:
  version: v1.20.0
  providers:
    - name: provider-kubernetes
      version: v0.16.0
```

Apply the file to onboarding cluster:

```shell
kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig apply -f ./config/crossplane-instance.yaml
```

The Crossplane service provider should now start to create the necessary resources for the new Crossplane instance. As a result, a new Crossplane service instance should soon be available.
You can check the status of the Crossplane instance using the following command:

```shell
kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig get crossplane -n default my-mcp -o yaml
```

After a while, you should see output similar to the following:

```yaml
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: Crossplane
metadata:
  finalizers:
  - openmcp.cloud/finalizers
  generation: 1
  name: sample
  namespace: default
spec:
  providers:
  - name: provider-kubernetes
    version: v0.16.0
  version: v1.20.0
status:
  conditions:
  - lastTransitionTime: "2025-09-16T14:09:56Z"
    message: Crossplane is healthy.
    reason: Healthy
    status: "True"
    type: CrossplaneReady
  - lastTransitionTime: "2025-09-16T14:10:01Z"
    message: ProviderKubernetes is healthy.
    reason: Healthy
    status: "True"
    type: ProviderKubernetesReady
  observedGeneration: 0
  phase: ""
```

Crossplane and the provider Kubernetes should now be available on the mcp cluster.

```shell
kubectl --kubeconfig ./kubeconfigs/my-mcp.kubeconfig api-resources | grep 'crossplane\|kubernetes'
```

## Example using the Gardener Cluster Provider

### Requirements

* A running Gardener installation (see the [Gardener documentation](https://gardener.cloud/docs/) for more information on Gardener)
* A Gardener project in which the clusters will be created
* An infrastructure secret in the Gardener project (see the [Gardener documentation](https://gardener.cloud/docs/getting-started/project/#infrastructure-secrets) for more information on how to create an infrastructure secret)
* Kubectl (see the [Kubectl installation guide](https://kubernetes.io/docs/tasks/tools/#kubectl) for more information on how to install kubectl)
* If the Gardener installation is using OIDC for authentication, install the [OIDC kubectl plugin](https://github.com/int128/kubelogin)
* Good understanding of Gardener and how to create Gardener Shoot clusters and Service Accounts in Gardener Projects.

### Create a configuration folder

Create a directory that will be used to store the configuration files and the kubeconfig files.
To keep this example simple, we will use a single directory named `config` in the current working directory.

```shell
mkdir config
```

All following examples will use the `config` directory as the configuration directory. If you use a different directory, replace all occurrences of `config` with your desired directory path.

Create a directory named `kubeconfigs` in the configuration folder to store the kubeconfig files of the created clusters.

```shell
mkdir kubeconfigs
```

### Create a Gardener Shoot for the Platform Cluster

openMCP requires a running Kubernetes cluster that acts as the platform cluster.
The platform cluster hosts the openmcp-operator and all service providers, cluster providers and platform services.
In this example, we will create a Gardener Shoot cluster that acts as the platform cluster. See the [Gardener documentation](https://gardener.cloud/docs/getting-started/shoots/) for more information on how to create a Gardener Shoot cluster.

Create a script folder named `scripts`:

```shell
mkdir scripts
```

Create a file named `get-shoot-kubeconfig.sh` in the `scripts` folder with the following content:

```shell title="scripts/get-shoot-kubeconfig.sh"
#!/usr/bin/env bash

GARDENER_SECRET=$1
NAMESPACE="garden-$2"
SHOOT_NAME=$3

REQUEST_PATH="$(mktemp -d)"
REQUEST="${REQUEST_PATH}/admin-kubeconfig-request.json"

echo "{ \"apiVersion\": \"authentication.gardener.cloud/v1alpha1\", \"kind\": \"AdminKubeconfigRequest\", \"spec\": { \"expirationSeconds\": 7776000 } }" > ${REQUEST} 2>/dev/null

KUBECONFIG=$(kubectl --kubeconfig "${GARDENER_SECRET}" create \
    -f ${REQUEST} \
    --raw /apis/core.gardener.cloud/v1beta1/namespaces/${NAMESPACE}/shoots/${SHOOT_NAME}/adminkubeconfig 2>/dev/null | jq -r ".status.kubeconfig" | base64 -d)


echo "${KUBECONFIG}"
```

Make the script executable:

```shell
chmod +x ./scripts/get-shoot-kubeconfig.sh
```

In order to execute this script, you need a kubeconfig file that has access to the Gardener installation. This can be aquired by navigating to the Gardener dashboard, then selecting your user (icon in the upper right corner) -> click 'My Account' and under `Access` download the Kubeconfig file.

Alternatively, you can create a service account with the `Admin` role in the Gardener project and then retrieve the kubeconfig for the service account. See the [Gardener documentation](https://gardener.cloud/docs/getting-started/project/#service-accounts) for more information on how to create a service account.

Now, create a new Gardener Shoot cluster in your Gardener project using the Gardener dashboard or the Gardener API via kubectl. The name of the Shoot cluster shall be `platform`.
Please consult the [Gardener documentation](https://gardener.cloud/docs/getting-started/shoots/) for more information on how to create a Gardener Shoot cluster.

Download the admin kubeconfig of the `platform` Shoot cluster using the script created above (`get-shoot-kubeconfig.sh`) and save it to a file named `platform.kubeconfig` in the `kubeconfigs` folder.

```shell
./scripts/get-shoot-kubeconfig.sh <path-to-gardener-kubeconfig> <your-gardener-project-name> platform > ./kubeconfigs/platform.kubeconfig
```

### Create a bootstrapping configuration file (bootstrapper-config.yaml) in the configuration folder

Replace `<your-org>` and `<your-repo>` with your Git organization and repository name.
The environment can be set to the logical environment name (e.g. `dev`, `prod`, `live-eu-west`) that will be used in the Git repository to separate different environments.
The branch can be set to the desired branch name in the Git repository that will be used to store the desired state of the openMCP landscape.

Get the latest version of the `github.com/openmcp/openmcp` root component:

```shell
TAG=$(curl -s "https://api.github.com/repos/openmcp-project/openmcp/releases/latest" | grep '"tag_name":' | cut -d'"' -f4)
echo "${TAG}"
```

In the bootstrapper configuration, replace `<openmcp-component-version>` with the latest version of the `github.com/openmcp-project/openmcp` root component:

```yaml title="config/bootstrapper-config.yaml"
component:
  location: ghcr.io/openmcp-project/components//github.com/openmcp-project/openmcp:<openmcp-component-version>

repository:
  url: https://github.com/<your-org>/<your-repo>
  branch: <branch-name>

environment: <environment-name>

openmcpOperator:
  config: {}
```

### Create a Git configuration file (git-config.yaml) in the configuration folder

For GitHub use a personal access token with `repo` write permissions.
It is also possible to use a fine-grained token. In this case, it requires read and write permissions for `Contents`.

```yaml title="config/git-config.yaml"
auth:
  basic:
    username: "<your-git-username>"
    password: "<your-git-token>"
```

### Run the `openmcp-bootstrapper` CLI tool to deploy FluxCD to the Platform Cluster

Run the `openmcp-bootstrapper` CLI tool to deploy FluxCD to the `platform` Gardener Shoot cluster:

```shell
docker run --rm -v ./config:/config -v ./kubeconfigs:/kubeconfigs ghcr.io/openmcp-project/images/openmcp-bootstrapper:${OPENMCP_BOOTSTRAPPER_VERSION} deploy-flux --git-config /config/git-config.yaml --kubeconfig /kubeconfigs/platform.kubeconfig /config/bootstrapper-config.yaml
```

You should see output similar to the following:

```shell
Info: Starting deployment of Flux controllers with config file: /config/bootstrapper-config.yaml.
Info: Ensure namespace flux-system exists
Info: Creating/updating git credentials secret flux-system/git
Info: Created/updated git credentials secret flux-system/git
Info: Creating working directory for gitops-templates
Info: Downloading templates
/tmp/openmcp.cloud.bootstrapper-3041773446/download: 9 file(s) with 691073 byte(s) written
Info: Arranging template files
Info: Arranged template files
Info: Applying templates from gitops-templates/fluxcd to deployment repository
Info: Kustomizing files in directory: /tmp/openmcp.cloud.bootstrapper-3041773446/repo/envs/dev/fluxcd
Info: Applying flux deployment objects
Info: Deployment of flux controllers completed
```

### Inspect the deployed FluxCD controllers and Kustomization

Load the kubeconfig of the Kind cluster and check the deployed FluxCD controllers and the created GitRepository and Kustomization.

```shell
kind get kubeconfig --name platform > ./kubeconfigs/platform.kubeconfig
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get pods -n flux-system
```

You should see output similar to the following:

```shell
NAME                                           READY   STATUS    RESTARTS   AGE
helm-controller-648cdbf8d8-8jhnf               1/1     Running   0          9m37s
image-automation-controller-56df4c78dc-qwmfm   1/1     Running   0          9m35s
image-reflector-controller-56f69fcdc9-pgcgx    1/1     Running   0          9m35s
kustomize-controller-b4c4dcdc8-g49gc           1/1     Running   0          9m38s
notification-controller-59d754d599-w7fjp       1/1     Running   0          9m36s
source-controller-6b45b6464f-jbgb6             1/1     Running   0          9m38s
```

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get gitrepositories.source.toolkit.fluxcd.io -A
````

You should see output similar to the following:

```shell
NAMESPACE     NAME           URL                                         AGE   READY   STATUS
flux-system   environments   https://github.com/<your-org>/<your-repo>   86s   False   failed to checkout and determine revision: unable to clone 'https://github.com/<your-org>/<your-repo>': couldn't find remote ref "refs/heads/<branch-name>"
```

This error is expected as the branch does not exist yet in the Git repository. The `openmcp-bootstrapper` will create the branch in the next step.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get kustomizations.kustomize.toolkit.fluxcd.io -A
```

You should see output similar to the following:

```shell
NAMESPACE     NAME          AGE     READY   STATUS
flux-system   flux-system   3m15s   False   Source artifact not found, retrying in 30s
```

This error is also expected as the GitRepository does not exist yet. The `openmcp-bootstrapper` will create the GitRepository in the next step.

### Run the `openmcp-bootstrapper` CLI tool to deploy openMCP to the Kind cluster

Update the bootstrapping configuration file (bootstrapper-config.yaml) to include the Gardener cluster provider and the openmcp-operator configuration.

Please replace `<environment-name>` with the logical environment name (e.g. `dev`, `prod`, `live-eu-west`) that will be used in the Git repository to separate different environments. Notice that the same environment name must be used in the `environment` field and in the scheduler profiles.

```yaml title="config/bootstrapper-config.yaml"
component:
  location: ghcr.io/openmcp-project/components//github.com/openmcp-project/openmcp:<openmcp-component-version>

repository:
  url: https://github.com/<your-org>/<your-repo>
  branch: <branch-name>

environment: <environment-name>

providers:
  clusterProviders:
  - name: gardener

openmcpOperator:
  config:
    managedControlPlane:
      mcpClusterPurpose: mcp-worker
      reconcileMCPEveryXDays: 7
    scheduler:
      scope: Cluster
      purposeMappings:
        mcp-worker:
          template:
            metadata:
              namespace: openmcp-system
            spec:
              profile: <environment-name>.gardener.shoot-small
              tenancy: Exclusive
        platform:
          template:
            metadata:
              namespace: openmcp-system
              labels:
                clusters.openmcp.cloud/delete-without-requests: "false"
            spec:
              profile: <environment-name>.gardener.shoot-small
              tenancy: Shared
        onboarding:
          template:
            metadata:
              namespace: openmcp-system
              labels:
                clusters.openmcp.cloud/delete-without-requests: "false"
            spec:
              profile: <environment-name>.gardener.shoot-workerless
              tenancy: Shared
        workload:
          tenancyCount: 20
          template:
            metadata:
              namespace: openmcp-system
            spec:
              profile: <environment-name>.gardener.shoot-small
              tenancy: Shared
```

Create a directory named `extra-manifests` in the configuration folder.

```shell
mkdir ./config/extra-manifests
```

In the `extra-manifests` folder, create a file named `gardener-landscape.yaml` with the following content:

```yaml title="config/extra-manifests/gardener-landscape.yaml"
apiVersion: gardener.clusters.openmcp.cloud/v1alpha1
kind: Landscape
metadata:
  name: gardener-landscape
spec:
  access:
    secretRef:
      name: gardener-landscape-kubeconfig
      namespace: openmcp-system
```

The gardener landscape configuration requires a secret that contains the kubeconfig to access the Gardener project. For that purpose, create a secret named `gardener-landscape-kubeconfig` in the `openmcp-system` namespace of the platform cluster that contains the kubeconfig file that has access to the Gardener installation.
See the [Gardener documentation](https://gardener.cloud/docs/dashboard/automated-resource-management/#create-a-service-account) on how to create a service account in the Gardener project using the Gardener dashboard.
Create a service account with at least the `admin` role in the Gardener project. Then [download](https://gardener.cloud/docs/dashboard/automated-resource-management/#use-the-service-account) the kubeconfig for the service account and save it to a file named `./kubeconfigs/gardener-landscape.kubeconfig`.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig create namespace openmcp-system
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig create secret generic gardener-landscape-kubeconfig --from-file=kubeconfig=./kubeconfigs/gardener-landscape.kubeconfig -n openmcp-system
```

The kubeconfig content can be retrieved from the Gardener dashboard or by creating a service account in the Gardener project. See the [Gardener documentation](https://gardener.cloud/docs/getting-started/project/#service-accounts) for more information on how to create a service account.
The service account requires at least the `admin` role in the Gardener project.

In the `extra-manifests` folder, create a file named `gardener-cluster-provider-shoot-small.yaml` with the following content:

<Tabs queryString="provider-config-shoot-small" defaultValue="GCP">

<TabItem value="GCP" label="GCP">
```yaml title="config/extra-manifests/gardener-cluster-provider-shoot-small.yaml"
apiVersion: gardener.clusters.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: shoot-small
spec:
  landscapeRef:
    name: gardener-landscape
  project: <gardener-project-name>
  providerRef:
    name: gardener
  shootTemplate:
    spec:
      cloudProfile:
        kind: CloudProfile
        name: gcp
      kubernetes:
        version: "<kubernetes-version>" # e.g. "1.32"
      maintenance:
        autoUpdate:
          kubernetesVersion: true
        timeWindow:
          begin: 220000+0200
          end: 230000+0200
      networking:
        nodes: 10.180.0.0/16
        type: calico
      provider:
        controlPlaneConfig:
          apiVersion: gcp.provider.extensions.gardener.cloud/v1alpha1
          kind: ControlPlaneConfig
          zone: <zone-name> # e.g. europe-west1-c
        infrastructureConfig:
          apiVersion: gcp.provider.extensions.gardener.cloud/v1alpha1
          kind: InfrastructureConfig
          networks:
            workers: 10.180.0.0/16
        type: gcp
        workers:
        - cri:
            name: containerd
          machine:
            architecture: amd64
            image:
              name: gardenlinux
              version: "<garden-linux-version>" # e.g. "1592.9.0"
            type: n1-standard-2
          maxSurge: 1
          maximum: 5
          minimum: 1
          name: default-worker
          volume:
            size: 50Gi
            type: pd-balanced
          zones:
          - <zone-name> # e.g. europe-west1-c
      purpose: evaluation
      region: <region-name> # e.g. europe-west1
      secretBindingName: <gardener-secret-binding-name>
```
</TabItem>

<TabItem value="AWS" label="AWS" >
```yaml title="config/extra-manifests/gardener-cluster-provider-shoot-small.yaml"
apiVersion: gardener.clusters.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: shoot-small
spec:
  landscapeRef:
    name: gardener-landscape
  project: <gardener-project-name>
  providerRef:
    name: gardener
  shootTemplate:
    spec:
      cloudProfile:
        kind: CloudProfile
        name: aws
      kubernetes:
        version: "<kubernetes-version>" # e.g. "1.32"
      maintenance:
        autoUpdate:
          kubernetesVersion: true
        timeWindow:
          begin: 220000+0200
          end: 230000+0200
      networking:
        type: calico
        nodes: 10.180.0.0/16
      provider:
        controlPlaneConfig:
          apiVersion: aws.provider.extensions.gardener.cloud/v1alpha1
          kind: ControlPlaneConfig
          cloudControllerManager:
            useCustomRouteController: true
          storage:
            managedDefaultClass: true
        infrastructureConfig:
          apiVersion: aws.provider.extensions.gardener.cloud/v1alpha1
          kind: InfrastructureConfig
          networks:
            vpc:
              cidr: 10.180.0.0/16
            zones:
              - name: <zone-name> # e.g. eu-west-1a
                workers: 10.180.0.0/19
                public: 10.180.32.0/20
                internal: 10.180.48.0/20
        type: aws
        workers:
        - cri:
            name: containerd
          machine:
            architecture: amd64
            image:
              name: gardenlinux
              version: "<garden-linux-version>" # e.g. "1592.9.0"
            type: m5.large
          maxSurge: 1
          maximum: 5
          minimum: 1
          name: default-worker
          volume:
            size: 50Gi
            type: gp3
          zones:
          - <zone-name> # e.g. eu-west-1a
      purpose: evaluation
      region: <region-name> # e.g. eu-west-1
      secretBindingName: <gardener-secret-binding-name>
```
</TabItem>

</Tabs>

In the `extra-manifests` folder, create a file named `gardener-cluster-provider-shoot-workerless.yaml` with the following content:

<Tabs queryString="provider-config-shoot-workerless" defaultValue="GCP">

<TabItem value="GCP" label="GCP">
```yaml title="config/extra-manifests/gardener-cluster-provider-shoot-workerless.yaml"
apiVersion: gardener.clusters.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: shoot-workerless
spec:
  landscapeRef:
    name: gardener-landscape
  project: <gardener-project-name>
  providerRef:
    name: gardener
  shootTemplate:
    spec:
      cloudProfile:
        kind: CloudProfile
        name: gcp
      kubernetes:
        version: "<kubernetes-version>" # e.g. "1.32"
      maintenance:
        autoUpdate:
          kubernetesVersion: true
        timeWindow:
          begin: 220000+0200
          end: 230000+0200
      provider:
        type: gcp
      purpose: evaluation
      region: <region-name> # eg europe-west1
```
</TabItem>

<TabItem value="AWS" label="AWS" >
```yaml title="config/extra-manifests/gardener-cluster-provider-shoot-workerless.yaml"
apiVersion: gardener.clusters.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: shoot-workerless
spec:
  landscapeRef:
    name: gardener-landscape
  project: <gardener-project-name>
  providerRef:
    name: gardener
  shootTemplate:
    spec:
      cloudProfile:
        kind: CloudProfile
        name: aws
      kubernetes:
        version: "<kubernetes-version>" # e.g. "1.32"
      maintenance:
        autoUpdate:
          kubernetesVersion: true
        timeWindow:
          begin: 220000+0200
          end: 230000+0200
      provider:
        type: aws
      purpose: evaluation
      region: <region-name> # e.g. eu-west-1
```
</TabItem>

</Tabs>

Replace `<gardener-project-name>` with the name of your Gardener project and `<gardener-secret-binding-name>` with the name of the secret binding that contains the infrastructure secret for your Gardener project.

Replace also `<kubernetes-version>` with the desired Kubernetes version (e.g. `1.32`), `<garden-linux-version>` with the desired Garden Linux version (e.g. `1592.9.0`), `<region-name>` with the desired region (e.g. `europe-west1`), and `<zone-name>` with the desired zone (e.g. `europe-west1-c`).

:::info
Please adjust the shoot configuration based on your specific needs, e.g. change `Evaluation` to `Production` as purpose, if you are planning to use the MCP for productive purposes. For all the details reg. Shoot configuration, please consult the respective Gardener documentation.
:::

Now run the `openmcp-bootstrapper` CLI tool to update the Git repository and deploy openMCP to the `platform` Gardener Shoot cluster:

```shell
docker run --rm -v ./config:/config -v ./kubeconfigs:/kubeconfigs ghcr.io/openmcp-project/images/openmcp-bootstrapper:${OPENMCP_BOOTSTRAPPER_VERSION} manage-deployment-repo --git-config /config/git-config.yaml --kubeconfig /kubeconfigs/platform.kubeconfig --extra-manifest-dir /config/extra-manifests /config/bootstrapper-config.yaml
```

You should see output similar to the following:

```shell
Info: Downloading component ghcr.io/openmcp-project/components//github.com/openmcp-project/openmcp:v0.0.25
Info: Creating template transformer
Info: Downloading template resources
/tmp/openmcp.cloud.bootstrapper-245193548/transformer/download/fluxcd: 9 file(s) with 691073 byte(s) written
/tmp/openmcp.cloud.bootstrapper-245193548/transformer/download/openmcp: 8 file(s) with 6625 byte(s) written
Info: Transforming templates into deployment repository structure
Info: Fetching openmcp-operator component version
Info: Cloning deployment repository https://github.com/reshnm/openmcp-deployment
Info: Checking out or creating branch gardener
Info: Applying templates from "gitops-templates/fluxcd"/"gitops-templates/openmcp" to deployment repository
Info: Templating providers: clusterProviders=[{gardener [] map[]}], serviceProviders=[], platformServices=[], imagePullSecrets=[]
Info: Applying Custom Resource Definitions to deployment repository
/tmp/openmcp.cloud.bootstrapper-245193548/repo/resources/openmcp/crds: 8 file(s) with 484832 byte(s) written
/tmp/openmcp.cloud.bootstrapper-245193548/repo/resources/openmcp/crds: 3 file(s) with 198428 byte(s) written
Info: Applying extra manifests from /config/extra-manifests to deployment repository
Info: Committing and pushing changes to deployment repository
Info: Created commit: ee2b6ef079808fbc198b4f6eced1afb89f64d1d1
Info: Running kustomize on /tmp/openmcp.cloud.bootstrapper-245193548/repo/envs/dev
Info: Applying Kustomization manifest: default/bootstrap
```

### Inspect the Git repository

The desired state of the openMCP landscape has now been created in the Git repository and should look similar to the following structure:

```shell
.
├── envs
│   └── dev
│       ├── fluxcd
│       │   ├── flux-kustomization.yaml
│       │   ├── gitrepo.yaml
│       │   └── kustomization.yaml
│       ├── kustomization.yaml
│       ├── openmcp
│       │   ├── config
│       │   │   └── openmcp-operator-config.yaml
│       │   └── kustomization.yaml
│       └── root-kustomization.yaml
└── resources
    ├── fluxcd
    │   ├── components.yaml
    │   ├── flux-kustomization.yaml
    │   ├── gitrepo.yaml
    │   └── kustomization.yaml
    ├── kustomization.yaml
    ├── openmcp
    │   ├── cluster-providers
    │   │   └── gardener.yaml
    │   ├── crds
    │   │   ├── clusters.openmcp.cloud_accessrequests.yaml
    │   │   ├── clusters.openmcp.cloud_clusterprofiles.yaml
    │   │   ├── clusters.openmcp.cloud_clusterrequests.yaml
    │   │   ├── clusters.openmcp.cloud_clusters.yaml
    │   │   ├── gardener.clusters.openmcp.cloud_clusterconfigs.yaml
    │   │   ├── gardener.clusters.openmcp.cloud_landscapes.yaml
    │   │   ├── gardener.clusters.openmcp.cloud_providerconfigs.yaml
    │   │   ├── openmcp.cloud_clusterproviders.yaml
    │   │   ├── openmcp.cloud_platformservices.yaml
    │   │   └── openmcp.cloud_serviceproviders.yaml
    │   ├── deployment.yaml
    │   ├── extra
    │   │   ├── gardener-cluster-provider-shoot-small.yaml
    │   │   ├── gardener-cluster-provider-shoot-workerless.yaml
    │   │   └── gardener-landscape.yaml
    │   ├── kustomization.yaml
    │   ├── namespace.yaml
    │   └── rbac.yaml
    └── root-kustomization.yaml
```

The `envs/<environment-name>` folder contains the Kustomization files that are used by FluxCD to deploy openMCP to the platform cluster.
The `resources` folder contains the base resources that are used by the Kustomization files in the `envs/<environment-name>` folder.

## Inspect the Kustomizations in the platform cluster

Force an update of the GitRepository and Kustomization in the Kind cluster to pick up the changes made in the Git repository.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig -n flux-system annotate gitrepository environments reconcile.fluxcd.io/requestedAt="$(date +%s)"
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig -n flux-system patch kustomization flux-system --type merge -p '{"spec":{"force":true}}'
```

Get the status of the GitRepository in the platform cluster.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get gitrepositories.source.toolkit.fluxcd.io -A
```

You should see output similar to the following:

```shell
NAMESPACE     NAME           URL                                          AGE    READY   STATUS
flux-system   environments   https://github.com/<your-ourg>/<your-repo>   9m6s   True    stored artifact for revision 'docs@sha1:...'
```
So we have now successfully configured FluxCD to watch for changes in the specified GitHub repository, using the `environments` custom resource of kind `GitRepository`.
Now let's get the status of the Kustomization in the Kind cluster.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get kustomizations.kustomize.toolkit.fluxcd.io -A
```

You should see output similar to the following:

```shell
NAMESPACE     NAME          AGE   READY   STATUS
default       bootstrap     5m31s   True    Applied revision: docs@sha1:...
flux-system   flux-system   10m     True    Applied revision: docs@sha1:...
```

You can see that there are now two Kustomizations in the platform cluster.
The `flux-system` Kustomization is used to deploy the FluxCD controllers and the `bootstrap` Kustomization is used to deploy openMCP to the platform cluster.

### Inspect the deployed openMCP components on the platform cluster

Now check the deployed openMCP components.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get pods -n openmcp-system
```

You should see output similar to the following:

```shell
NAME                                      READY   STATUS      RESTARTS   AGE
cp-gardener-7f77684ffb-gw4jg              1/1     Running     0          35m
cp-gardener-init-wxnt4                    0/1     Completed   0          35m
openmcp-operator-785b967f66-h2dlh         1/1     Running     0          67m
ps-managedcontrolplane-5b77749f7b-mtffp   1/1     Running     0          64m
ps-managedcontrolplane-init-pklrl         0/1     Completed   0          67m
```

So now, the openmcp-operator, the managedcontrolplane platform service and the cluster provider gardener are running.
You are now ready to create and manage clusters using openMCP.

### Inspect cluster profiles and clusters

Based on the provider configuration for the Gardener cluster provider, two cluster profiles should have been created: `dev.gardener.shoot-small` and `dev.gardener.shoot-workerless`.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get clusterprofiles.clusters.openmcp.cloud
```

You should see output similar to the following:

```shell
NAME                            PROVIDER   CONFIG
dev.gardener.shoot-small        gardener   shoot-small
dev.gardener.shoot-workerless   gardener   shoot-workerless
```

As you can see, these names match the profile names used in the openmcp-operator configuration. The nameing convention is `<environment-name>.<cluster-provider-name>.<profile>`.

Inspecting a cluster profile, shows the supported kubernetes versions:

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get clusterprofiles.clusters.openmcp.cloud dev.gardener.shoot-small -o yaml
```

You should see output similar to the following:

```yaml
apiVersion: clusters.openmcp.cloud/v1alpha1
kind: ClusterProfile
metadata:
  creationTimestamp: "2025-10-01T06:38:48Z"
  generation: 1
  name: dev.gardener.shoot-small
  resourceVersion: "173288"
  uid: 926aa91c-f021-41f7-b97c-dc7eaf0e19bf
spec:
  providerConfigRef:
    name: shoot-small
  providerRef:
    name: gardener
  supportedVersions:
  - version: 1.33.3
  - deprecated: true
    version: 1.33.2
  - version: 1.32.7
  - deprecated: true
    version: 1.32.6
  - deprecated: true
    version: 1.32.5
  - deprecated: true
    version: 1.32.4
  - deprecated: true
    version: 1.32.3
  - deprecated: true
    version: 1.32.2
  - version: 1.31.11
  - deprecated: true
    version: 1.31.10
  - deprecated: true
    version: 1.31.9
  - deprecated: true
    version: 1.31.8
  - deprecated: true
    version: 1.31.7
  - deprecated: true
    version: 1.31.6
  - deprecated: true
    version: 1.31.5
  - deprecated: true
    version: 1.31.4
  - deprecated: true
    version: 1.31.3
  - deprecated: true
    version: 1.31.2
  - version: 1.30.14
  - deprecated: true
    version: 1.30.13
  - deprecated: true
    version: 1.30.12
  - deprecated: true
    version: 1.30.11
  - deprecated: true
    version: 1.30.10
  - deprecated: true
    version: 1.30.9
  - deprecated: true
    version: 1.30.8
  - deprecated: true
    version: 1.30.7
  - deprecated: true
    version: 1.30.6
  - deprecated: true
    version: 1.30.5
  - deprecated: true
    version: 1.30.4
  - deprecated: true
    version: 1.30.3
  - deprecated: true
    version: 1.30.2
  - deprecated: true
    version: 1.30.1
```

You can also see the onboarding cluster that has been created by the openmcp-operator.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get clusters.clusters.openmcp.cloud -A
```

You should see output similar to the following:

```shell
NAMESPACE        NAME         PURPOSES         PHASE   VERSION   PROVIDER   AGE
openmcp-system   onboarding   ["onboarding"]   Ready   1.32.7    gardener   30m
```

You can also get the shoot name of the onboarding cluster:

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get clusters.clusters.openmcp.cloud --namespace openmcp-system onboarding -o jsonpath="{.status.providerStatus.shoot.metadata.name}"
```

You should see output similar to the following:

```shell
s-hl4uutd4
```

If you want, you can inspect the Gardener shoot in your Gardener project.

### Get Access to the Onboarding Cluster

In order to create resources on the onboarding cluster, you need to get access to the onboarding cluster.
To do so, create an access request that grants admin permissions  on the onboarding cluster.

Create a file named `onboarding-access-request.yaml` in the configuration folder with the following content:

```yam title="config/onboarding-access-request.yaml"
apiVersion: clusters.openmcp.cloud/v1alpha1
kind: AccessRequest
metadata:
  name: bootstrapper-onboarding
  namespace: openmcp-system
spec:
  clusterRef:
    name: onboarding
    namespace: openmcp-system
  token:
    permissions:
    - rules:
      - apiGroups:
        - '*'
        resources:
        - '*'
        verbs:
        - '*'
```

Then apply the file to the platform cluster:

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig apply -f ./config/onboarding-access-request.yaml
```

You can check the status of the access request using the following command:

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get accessrequests.clusters.openmcp.cloud --namespace openmcp-system bootstrapper-onboarding
```

Once the access request has been granted, you should see output similar to the following:

```shell
NAME                      PHASE
bootstrapper-onboarding   Granted
```

Now you can get the kubeconfig of the onboarding cluster using the following command:

```shell
SECRET_NAME=$(kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get accessrequests.clusters.openmcp.cloud --namespace openmcp-system bootstrapper-onboarding -o jsonpath="{.status.secretRef.name}")
SECRET_NAMESPACE=$(kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get accessrequests.clusters.openmcp.cloud --namespace openmcp-system bootstrapper-onboarding -o jsonpath="{.status.secretRef.namespace}")
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get secret ${SECRET_NAME} -n ${SECRET_NAMESPACE} -o jsonpath="{.data.kubeconfig}" | base64 -d > ./kubeconfigs/onboarding.kubeconfig
```

### Create a Managed Control Plane on the Onboarding Cluster

Create a file named `my-mcp.yaml` with the following content in the configuration folder:

```yaml title="config/my-mcp.yaml"
apiVersion: core.openmcp.cloud/v2alpha1
kind: ManagedControlPlaneV2
metadata:
  name: my-mcp
  namespace: default
spec:
  iam:
    tokens:
    - name: admin
      roleRefs:
      - kind: ClusterRole
        name: cluster-admin
```

Apply the file to the onboarding cluster:

```shell
kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig apply -f ./config/my-mcp.yaml
```

The openmcp-operator should start to create the necessary resources in order to create the managed control plane. As a result, a new `Managed Control Plane` should be available soon.
You can check the status of the Managed Control Plane using the following command:

```shell
kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig get managedcontrolplanev2 -n default my-mcp -o yaml
```

After some time (this can take about 10 to 15 minutes), you should see output similar to the following:

```yaml
apiVersion: core.openmcp.cloud/v2alpha1
kind: ManagedControlPlaneV2
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"core.openmcp.cloud/v2alpha1","kind":"ManagedControlPlaneV2","metadata":{"annotations":{},"name":"my-mcp","namespace":"default"},"spec":{"iam":{"tokens":[{"name":"admin","roleRefs":[{"kind":"ClusterRole","name":"cluster-admin"}]}]}}}
  creationTimestamp: "2025-10-01T11:02:29Z"
  finalizers:
  - core.openmcp.cloud/mcp
  - request.clusters.openmcp.cloud/my-mcp
  generation: 1
  name: my-mcp
  namespace: default
  resourceVersion: "32021"
  uid: acd0ce65-df78-4667-8b9c-540843a43294
spec:
  iam:
    tokens:
    - name: admin
      roleRefs:
      - kind: ClusterRole
        name: cluster-admin
status:
  access:
    token_admin:
      name: zmr7k5u7
  conditions:
  - lastTransitionTime: "2025-10-01T11:06:35Z"
    message: ""
    observedGeneration: 1
    reason: AccessReady:token_admin_True
    status: "True"
    type: AccessReady.token_admin
  - lastTransitionTime: "2025-10-01T11:06:35Z"
    message: All accesses are ready
    observedGeneration: 1
    reason: AllAccessReady_True
    status: "True"
    type: AllAccessReady
  - lastTransitionTime: "2025-10-01T11:02:34Z"
    message: ""
    observedGeneration: 1
    reason: ClusterConfigurations_True
    status: "True"
    type: Cluster.ClusterConfigurations
  - lastTransitionTime: "2025-10-01T11:06:35Z"
    message: API server /healthz endpoint responded with success status code.
    observedGeneration: 1
    reason: HealthzRequestSucceeded
    status: "True"
    type: Cluster.Gardener_APIServerAvailable
  - lastTransitionTime: "2025-10-01T11:21:55Z"
    message: All control plane components are healthy.
    observedGeneration: 1
    reason: ControlPlaneRunning
    status: "True"
    type: Cluster.Gardener_ControlPlaneHealthy
  - lastTransitionTime: "2025-10-01T11:21:55Z"
    message: All nodes are ready.
    observedGeneration: 1
    reason: EveryNodeReady
    status: "True"
    type: Cluster.Gardener_EveryNodeReady
  - lastTransitionTime: "2025-10-01T11:21:55Z"
    message: All observability components are healthy.
    observedGeneration: 1
    reason: ObservabilityComponentsRunning
    status: "True"
    type: Cluster.Gardener_ObservabilityComponentsHealthy
  - lastTransitionTime: "2025-10-01T11:21:55Z"
    message: All system components are healthy.
    observedGeneration: 1
    reason: SystemComponentsRunning
    status: "True"
    type: Cluster.Gardener_SystemComponentsHealthy
  - lastTransitionTime: "2025-10-01T11:02:34Z"
    message: ""
    observedGeneration: 1
    reason: LandscapeManagement_True
    status: "True"
    type: Cluster.LandscapeManagement
  - lastTransitionTime: "2025-10-01T11:02:34Z"
    message: ""
    observedGeneration: 1
    reason: Meta_True
    status: "True"
    type: Cluster.Meta
  - lastTransitionTime: "2025-10-01T11:02:34Z"
    message: ""
    observedGeneration: 1
    reason: ShootManagement_True
    status: "True"
    type: Cluster.ShootManagement
  - lastTransitionTime: "2025-10-01T11:02:34Z"
    message: Cluster conditions have been synced to MCP
    observedGeneration: 1
    reason: ClusterConditionsSynced_True
    status: "True"
    type: ClusterConditionsSynced
  - lastTransitionTime: "2025-10-01T11:02:34Z"
    message: ClusterRequest is ready
    observedGeneration: 1
    reason: ClusterRequestReady_True
    status: "True"
    type: ClusterRequestReady
  - lastTransitionTime: "2025-10-01T11:02:29Z"
    message: ""
    observedGeneration: 1
    reason: Meta_True
    status: "True"
    type: Meta
  observedGeneration: 1
  phase: Ready
```

The `status.phase` should be `Ready` and the `AllAccessReady` condition should be `True`.

You can now get the kubeconfig of the managed control plane using the following command:

```shell
TOKEN_NAME=$(kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig get managedcontrolplanev2 -n default my-mcp -o jsonpath="{.status.access.token_admin.name}")
TOKEN_NAMESPACE=$(kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig get managedcontrolplanev2 -n default my-mcp -o jsonpath="{.metadata.namespace}")
kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig get secret ${TOKEN_NAME} -n ${TOKEN_NAMESPACE} -o jsonpath="{.data.kubeconfig}" | base64 -d > ./kubeconfigs/my-mcp.kubeconfig
```

### Deploy the Crossplane Service Provider on the platform cluster

Update the bootstrapping configuration file (bootstrapper-config.yaml) to include the crossplane service provider.

```yaml title="config/bootstrapper-config.yaml"
component:
  location: ghcr.io/openmcp-project/components//github.com/openmcp-project/openmcp:<openmcp-component-version>

repository:
  url: https://github.com/<your-org>/<your-repo>
  branch: <branch-name>

environment: <environment-name>

providers:
  clusterProviders:
  - name: gardener
  serviceProviders:
  - name: crossplane

openmcpOperator:
  config:
    managedControlPlane:
      mcpClusterPurpose: mcp-worker
      reconcileMCPEveryXDays: 7
    scheduler:
      scope: Cluster
      purposeMappings:
        mcp-worker:
          template:
            metadata:
              namespace: openmcp-system
            spec:
              profile: <environment-name>.gardener.shoot-small
              tenancy: Exclusive
        platform:
          template:
            metadata:
              namespace: openmcp-system
              labels:
                clusters.openmcp.cloud/delete-without-requests: "false"
            spec:
              profile: <environment-name>.gardener.shoot-small
              tenancy: Shared
        onboarding:
          template:
            metadata:
              namespace: openmcp-system
              labels:
                clusters.openmcp.cloud/delete-without-requests: "false"
            spec:
              profile: <environment-name>.gardener.shoot-workerless
              tenancy: Shared
        workload:
          tenancyCount: 20
          template:
            metadata:
              namespace: openmcp-system
            spec:
              profile: <environment-name>.gardener.shoot-small
              tenancy: Shared
```

Then create a file named `crossplane-provider.yaml` with the following content, and save it in the new `extra-manifests` folder.

```yaml title="config/extra-manifests/crossplane-provider.yaml"
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: default
spec:
  chart:
    repository: "https://charts.crossplane.io/stable"
    name: crossplane
    availableVersions:
      - v1.20.0
      - v1.19.0
  availableProviders:
    - name: provider-kubernetes
      package: xpkg.upbound.io/upbound/provider-kubernetes
      versions:
        - v0.16.0
```

Run the `openmcp-bootstrapper` CLI tool to update the Git repository and deploy the crossplane service provider to the Shoot cluster.

```shell
docker run --rm  -v ./config:/config -v ./kubeconfigs:/kubeconfigs ghcr.io/openmcp-project/images/openmcp-bootstrapper:${OPENMCP_BOOTSTRAPPER_VERSION} manage-deployment-repo --git-config /config/git-config.yaml --kubeconfig /kubeconfigs/platform.kubeconfig --extra-manifest-dir /config/extra-manifests /config/bootstrapper-config.yaml
```

See the `--extra-manifest-dir` parameter that points to the folder containing the extra manifest file created in the previous step. All manifest files in this folder will be added to the Kustomization used by FluxCD to deploy openMCP to the Shoot cluster.

The git repository should now be updated:

```shell
.
├── envs
│   └── dev
│       ├── fluxcd
│       │   ├── flux-kustomization.yaml
│       │   ├── gitrepo.yaml
│       │   └── kustomization.yaml
│       ├── kustomization.yaml
│       ├── openmcp
│       │   ├── config
│       │   │   └── openmcp-operator-config.yaml
│       │   └── kustomization.yaml
│       └── root-kustomization.yaml
└── resources
    ├── fluxcd
    │   ├── components.yaml
    │   ├── flux-kustomization.yaml
    │   ├── gitrepo.yaml
    │   └── kustomization.yaml
    ├── kustomization.yaml
    ├── openmcp
    │   ├── cluster-providers
    │   │   └── gardener.yaml
    │   ├── crds
    │   │   ├── clusters.openmcp.cloud_accessrequests.yaml
    │   │   ├── clusters.openmcp.cloud_clusterprofiles.yaml
    │   │   ├── clusters.openmcp.cloud_clusterrequests.yaml
    │   │   ├── clusters.openmcp.cloud_clusters.yaml
    │   │   ├── crossplane.services.openmcp.cloud_providerconfigs.yaml
    │   │   ├── gardener.clusters.openmcp.cloud_clusterconfigs.yaml
    │   │   ├── gardener.clusters.openmcp.cloud_landscapes.yaml
    │   │   ├── gardener.clusters.openmcp.cloud_providerconfigs.yaml
    │   │   ├── openmcp.cloud_clusterproviders.yaml
    │   │   ├── openmcp.cloud_platformservices.yaml
    │   │   └── openmcp.cloud_serviceproviders.yaml
    │   ├── deployment.yaml
    │   ├── extra
    │   │   ├── crossplane-provider.yaml
    │   │   ├── gardener-cluster-provider-shoot-small.yaml
    │   │   ├── gardener-cluster-provider-shoot-workerless.yaml
    │   │   └── gardener-landscape.yaml
    │   ├── kustomization.yaml
    │   ├── namespace.yaml
    │   ├── rbac.yaml
    │   └── service-providers
    │       └── crossplane.yaml
    └── root-kustomization.yaml
```

After a while, the Kustomization in the platform cluster should be updated and the crossplane service provider should be deployed:
You can force an update of the Kustomization in the platform cluster to pick up the changes made in the Git repository.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig -n flux-system annotate gitrepository environments reconcile.fluxcd.io/requestedAt="$(date +%s)"
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig -n default patch kustomization bootstrap --type merge -p '{"spec":{"force":true}}'
```

List the pods in the `openmcp-system` namespace again:

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get pods -n openmcp-system
````

You should see output similar to the following:

```shell
NAME                                      READY   STATUS      RESTARTS   AGE
cp-gardener-84b7ff4c9c-vf2sc              1/1     Running     0          3m3s
cp-gardener-init-xr7fs                    0/1     Completed   0          3m7s
openmcp-operator-785b967f66-h2dlh         1/1     Running     0          74m
ps-managedcontrolplane-5b77749f7b-mtffp   1/1     Running     0          71m
ps-managedcontrolplane-init-pklrl         0/1     Completed   0          74m
```

You should see that the crossplane service provider is running. This means that from now on, the openMCP is able to provide Crossplane service instances, using the new service provider Crossplane.

### Create a Crossplane service instance on the onboarding cluster

Create a file named `crossplane-instance.yaml` with the following content in the configuration folder:

```yaml title="config/crossplane-instance.yaml"
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: Crossplane
metadata:
  name: my-mcp
  namespace: default
spec:
  version: v1.20.0
  providers:
    - name: provider-kubernetes
      version: v0.16.0
```

Apply the file to onboarding cluster:

```shell
kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig apply -f ./config/crossplane-instance.yaml
```

The Crossplane service provider should now start to create the necessary resources for the new Crossplane instance. As a result, a new Crossplane service instance should soon be available.
You can check the status of the Crossplane instance using the following command:

```shell
kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig get crossplane -n default my-mcp -o yaml
```

After a while, you should see output similar to the following:

```yaml
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: Crossplane
metadata:
  finalizers:
  - openmcp.cloud/finalizers
  generation: 1
  name: sample
  namespace: default
spec:
  providers:
  - name: provider-kubernetes
    version: v0.16.0
  version: v1.20.0
status:
  conditions:
  - lastTransitionTime: "2025-09-16T14:09:56Z"
    message: Crossplane is healthy.
    reason: Healthy
    status: "True"
    type: CrossplaneReady
  - lastTransitionTime: "2025-09-16T14:10:01Z"
    message: ProviderKubernetes is healthy.
    reason: Healthy
    status: "True"
    type: ProviderKubernetesReady
  observedGeneration: 0
  phase: ""
```

Crossplane and the provider Kubernetes should now be available on the mcp cluster.

```shell
kubectl --kubeconfig ./kubeconfigs/my-mcp.kubeconfig api-resources | grep 'crossplane\|kubernetes'
```
