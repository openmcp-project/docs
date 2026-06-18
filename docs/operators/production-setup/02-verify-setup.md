---
sidebar_position: 2
id: verify-setup
---

# Verify Setup

After deploying OpenControlPlane using the bootstrapper on Gardener, verify that all components are running correctly.

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

## Inspect the deployed OpenControlPlane components

Check the deployed OpenControlPlane components:

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

## Create a ControlPlane

Create a file named `my-mcp.yaml` with the following content in the configuration folder:

:::apply-to-onboarding-api

```yaml title="config/my-mcp.yaml"
apiVersion: core.open-control-plane.io/v2alpha1
kind: ControlPlane
metadata:
  name: my-mcp
  namespace: default
spec:
  iam: {}
```

:::

Apply the file to the onboarding cluster:

```shell
kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig apply -f ./config/my-mcp.yaml
```

The openmcp-operator should start to create the necessary resources in order to create the ControlPlane. As a result, a new `ControlPlane` should be available soon.

Wait for it to become ready:

```shell
kubectl --kubeconfig ./kubeconfigs/onboarding.kubeconfig get controlplane -n default my-mcp -w
```

Once provisioning completes, you will see:

```
NAME     PHASE
my-mcp   Ready
```

The platform has provisioned an isolated cluster for this control plane.
