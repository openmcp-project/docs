---
sidebar_position: 2
slug: /operators/gardener-provider
---

import Tabs from '@theme/Tabs';
import CodeBlock from '@theme/CodeBlock';
import TabItem from '@theme/TabItem';

# Prod: Run on Gardener

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
  pushBranch: <branch-name>

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
  pushBranch: <branch-name>

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

