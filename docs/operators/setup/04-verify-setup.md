---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import CodeBlock from '@theme/CodeBlock';
import TabItem from '@theme/TabItem';

# Verify Setup

After deploying OpenMCP using the bootstrapper, verify that all components are running correctly.

<Tabs groupId="cluster-provider">
<TabItem value="kind" label="Kind Provider">

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

## Inspect the deployed openMCP components in the Kind cluster

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

## Get Access to the Onboarding Cluster

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

## Create a Managed Control Plane

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
    message: Cluster conditions have been synced to ManagedControlPlane
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

## Deploy the Crossplane Service Provider

Update the bootstrapping configuration file (bootstrapper-config.yaml) to include the crossplane service provider.

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

:::info
Note that service provider crossplane only supports the installation of crossplane from an OCI registry. Replace the chart locations in the `ProviderConfig` with the OCI registry where you mirror your crossplane chart versions. OpenMCP will provide this as part of an open source [Releasechannel](https://github.com/openmcp-project/backlog/issues/323) in an upcoming update.
:::

```yaml title="config/extra-manifests/crossplane-provider.yaml"
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: default
spec:
  versions:
    - version: v2.0.2
      chart:
        url: ghcr.io/openmcp-project/charts/crossplane:2.0.2
      image:
        url: xpkg.crossplane.io/crossplane/crossplane:v2.0.2
    - version: v1.20.1
      chart:
        url: ghcr.io/openmcp-project/charts/crossplane:1.20.1
      image:
        url: xpkg.crossplane.io/crossplane/crossplane:v1.20.1
  providers:
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
    │   │   ├── crossplane.services.openmcp.cloud_providerconfigs.yaml
    │   │   ├── kind.clusters.openmcp.cloud_providerconfigs.yaml
    │   │   ├── openmcp.cloud_clusterproviders.yaml
    │   │   ├── openmcp.cloud_platformservices.yaml
    │   │   └── openmcp.cloud_serviceproviders.yaml
    │   ├── deployment.yaml
    │   ├── extra
    │   │   └── crossplane-providers.yaml
    │   ├── kustomization.yaml
    │   ├── namespace.yaml
    │   ├── rbac.yaml
    │   └── service-providers
    │       └── crossplane.yaml
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

## Create a Crossplane service instance on the onboarding cluster

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

</TabItem>
<TabItem value="gardener" label="Gardener Provider">

## Inspect the Kustomizations in the platform cluster

After running the bootstrapper for Gardener, verify the deployment status.

Force an update of the GitRepository and Kustomization in the platform cluster to pick up the changes made in the Git repository.

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig -n flux-system annotate gitrepository environments reconcile.fluxcd.io/requestedAt="$(date +%s)"
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig -n flux-system patch kustomization flux-system --type merge -p '{"spec":{"force":true}}'
```

Get the status of the GitRepository:

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get gitrepositories.source.toolkit.fluxcd.io -A
```

Get the status of the Kustomizations:

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get kustomizations.kustomize.toolkit.fluxcd.io -A
```

You should see the `flux-system` and `bootstrap` Kustomizations in Ready state.

## Inspect the deployed openMCP components

Check the deployed openMCP components:

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get pods -n openmcp-system
```

You should see the openmcp-operator, managedcontrolplane platform service, and the gardener cluster provider running.

## Get Access to the Onboarding Cluster

Check that the onboarding cluster has been created:

```shell
kubectl --kubeconfig ./kubeconfigs/platform.kubeconfig get clusters.clusters.openmcp.cloud -A
```

For Gardener, retrieve the onboarding cluster kubeconfig using the Gardener API or dashboard, then save it to `./kubeconfigs/onboarding.kubeconfig`.

## Create a Managed Control Plane

Follow the same steps as the Kind provider to create a managed control plane on the onboarding cluster.

</TabItem>
</Tabs>
