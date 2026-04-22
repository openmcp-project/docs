---
sidebar_position: 1
slug: /operators/kind-provider
---

import Tabs from '@theme/Tabs';
import CodeBlock from '@theme/CodeBlock';
import TabItem from '@theme/TabItem';

# Dev: Run on Kind

## Requirements

* [Docker](https://docs.docker.com/get-docker/) installed and running. Docker alternatively can be replaced with another OCI runtime (e.g. Podman) that can run the `openmcp-bootstrapper` CLI tool as an OCI image.
* [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/) installed

:::info
If you are using a docker alternative, make sure that it is correctly setup regarding Docker compatibility. In case of Podman, you should find a corresponding configuration under `Settings` in the Podman UI.
:::

## Create a configuration folder

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

## Create the Kind configuration file (kind-config.yaml) in the configuration folder

```yaml
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
- role: control-plane
  extraMounts:
  - hostPath: /var/run/docker.sock
    containerPath: /var/run/host-docker.sock
```

## Create the Kind cluster

Create the Kind cluster using the configuration file created in the previous step.

:::warning

Please check if your current `kind` network has a `/16` subnet. This is required for our cluster-provider-kind.
You can check the current network configuration using:

```shell
docker network inspect kind | jq ".[].IPAM.Config.[].Subnet"
"172.19.0.0/16"
```

If the result is not specifying `/16` but something smaller like `/24` you need to delete the network and create a new one. For that **all kind clusters needs to be deleted**. Then run:

```shell
docker network rm kind

docker network create kind --subnet 172.19.0.0/16
```

:::

:::info Podman Support
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

## Create a bootstrapping configuration file (bootstrapper-config.yaml) in the configuration folder

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
  pushBranch: <branch-name>

environment: <environment-name>

openmcpOperator:
  config: {}
```

## Create a Git configuration file (git-config.yaml) in the configuration folder

For GitHub use a personal access token with `repo` write permissions.
It is also possible to use a fine-grained token. In this case, it requires read and write permissions for `Contents`.

```yaml title="config/git-config.yaml"
auth:
  basic:
    username: "<your-git-username>"
    password: "<your-git-token>"
```

## Run the `openmcp-bootstrapper` CLI tool and deploy FluxCD to the Kind cluster

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

## Inspect the deployed FluxCD controllers and Kustomization

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

## Run the `openmcp-bootstrapper` CLI tool to deploy openMCP to the Kind cluster

Update the bootstrapping configuration file (bootstrapper-config.yaml) to include the kind cluster provider and the openmcp-operator configuration.

```yaml title="config/bootstrapper-config.yaml"
component:
  location: ghcr.io/openmcp-project/components//github.com/openmcp-project/openmcp:<openmcp-component-version>

repository:
  url: https://github.com/<your-org>/<your-repo>
  pushBranch: <branch-name>

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

## Inspect the Git repository

The desired state of the openMCP landscape has now been created in the Git repository and should look similar to the following structure:

```shell
.
├── envs
│   └── dev
│       ├── fluxcd
│       │   ├── flux-kustomization.yaml
│       │   ├── gitrepo.yaml
│       │   └── kustomization.yaml
│       ├── kustomization.yaml
│       ├── openmcp
│       │   ├── config
│       │   │   └── openmcp-operator-config.yaml
│       │   └── kustomization.yaml
│       └── root-kustomization.yaml
└── resources
    ├── fluxcd
    │   ├── components.yaml
    │   ├── flux-kustomization.yaml
    │   ├── gitrepo.yaml
    │   └── kustomization.yaml
    ├── kustomization.yaml
    ├── openmcp
    │   ├── cluster-providers
    │   │   └── kind.yaml
    │   ├── crds
    │   │   ├── clusters.openmcp.cloud_accessrequests.yaml
    │   │   ├── clusters.openmcp.cloud_clusterprofiles.yaml
    │   │   ├── clusters.openmcp.cloud_clusterrequests.yaml
    │   │   ├── clusters.openmcp.cloud_clusters.yaml
    │   │   ├── kind.clusters.openmcp.cloud_providerconfigs.yaml
    │   │   ├── openmcp.cloud_clusterproviders.yaml
    │   │   ├── openmcp.cloud_platformservices.yaml
    │   │   └── openmcp.cloud_serviceproviders.yaml
    │   ├── deployment.yaml
    │   ├── kustomization.yaml
    │   ├── namespace.yaml
    │   └── rbac.yaml
    └── root-kustomization.yaml
```

The `envs/<environment-name>` folder contains the Kustomization files that are used by FluxCD to deploy openMCP to the Kind cluster.
The `resources` folder contains the base resources that are used by the Kustomization files in the `envs/<environment-name>` folder.

## Next Steps

Continue to [Verify Setup](./verify-setup) to inspect the Kustomizations and deployed components.
