---
sidebar_position: 1
id: quickstart
---

# Quickstart

Get OpenControlPlane running on your local machine in under 10 minutes. By the end, you'll have a platform that hands out managed `ControlPlanes` with the capability for teams to request Flux.

:::note
[`ocpctl`](https://github.com/openmcp-project/ocpctl) is the CLI for managing OpenControlPlane environments locally and in production. It is under active development. Some commands and flags may change.
:::

## What You'll Build

```mermaid
flowchart LR
    A["<b>Platform Cluster</b><br/>runs platform services + providers"] -->|manages| B["<b>Onboarding Cluster</b><br/>teams request ControlPlanes here"]
    B -->|provisions| C["<b>ControlPlane Cluster</b><br/>your isolated ControlPlane"]
```

OpenControlPlane creates three clusters that work together:

| Cluster | Who uses it | Purpose |
|---------|-------------|---------|
| 🟢 **Platform** | Platform operators | Runs platform services, cluster providers, and service providers |
| 🔵 **Onboarding** | End users (teams) | API surface where teams create `ControlPlanes` |
| 🟣 **ControlPlane** | End users (teams) | One per team, isolated workspace with requested services |

The separation ensures end users never touch infrastructure. They interact only with the Onboarding cluster to request resources, and their services appear on their own `ControlPlane` cluster.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) running (8 GB RAM allocated to it)
- [Go](https://go.dev/doc/install) installed
- [`kubectl`](https://kubernetes.io/docs/tasks/tools/) CLI installed
- [`kind`](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) CLI installed
- [`flux`](https://fluxcd.io/flux/installation/#install-the-flux-cli) CLI installed
- ~10 minutes

## Install ocpctl

```shell
go install github.com/openmcp-project/ocpctl@v0.1.3
```

Or download a pre-built binary from the [releases page](https://github.com/openmcp-project/ocpctl/releases/latest).

---

## Step 1: Start the platform

```shell
ocpctl env apply local
```

This takes a few minutes. It creates a local Kind-based environment with the full OpenControlPlane stack: `openmcp-operator`, `cluster-provider-kind`, plus an onboarding cluster and pre-installed services that you can consume.

Verify the platform is running:

:::apply-to-platform

```shell
kubectl config use-context kind-local-platform
kubectl get pods -n openmcp-system
```

You should see these pods in `Running` state:

```
NAME                                      READY   STATUS      RESTARTS   AGE
cp-kind-5cf448bb88-trj47                  1/1     Running     0          106s
cp-kind-init-wxsbg                        0/1     Completed   0          113s
openmcp-operator-5b7f788ddb-474tg         1/1     Running     0          2m15s
ps-gateway-5db88d9474-6sxsp               1/1     Running     0          67s
ps-gateway-init-hpjqq                     0/1     Completed   0          113s
ps-helmdeployer-644d7454fc-zr2h5          1/1     Running     0          110s
ps-helmdeployer-init-lmjxr                0/1     Completed   0          113s
ps-managedcontrolplane-7958959559-tmlwf   1/1     Running     0          90s
ps-managedcontrolplane-init-t46cn         0/1     Completed   0          113s
sp-crossplane-84f8bbfb58-24lwl            1/1     Running     0          79s
sp-crossplane-init-z657s                  0/1     Completed   0          113s
sp-flux-844b667b9c-mhlqn                  1/1     Running     0          73s
sp-flux-init-x5pxw                        0/1     Completed   0          112s
sp-kro-ffbdcf787-zjrfz                    1/1     Running     0          83s
sp-kro-init-rf5vk                         0/1     Completed   0          113s
sp-ocm-756946b9dd-g67sd                   1/1     Running     0          70s
sp-ocm-init-6cp5c                         0/1     Completed   0          111s
```

:::

In this output we can see that openmcp-operator and multiple other services like cluster-provider-kind (cp-kind) and service providers such as Crossplane, Flux, Kro and OCM are running.

:::note Error
We might see that Platform Service Gateway (`ps-gateway-5db88d9474-6sxsp`) has an ERROR.

```shell
...
Error: applying resources: applying Unstructured//gateway: no matches for kind "GatewayServiceConfig" in version "gateway.openmcp.cloud/v1alpha1"
```

Please wait for a couple of seconds and then try execute `ocpctl env apply local` again. This will restart the Pod. All Pods above should be running eventually.
:::

### Configure allowed Flux versions

In order that end users can request Flux getting installed in a `ControlPlane`, as Platform Owner, we need to make sure to configure allowed versions of Flux. We can configure them via a `ProviderConfig`:

:::apply-to-platform

```shell
flux install
kubectl apply -f - <<EOF
apiVersion: flux.services.open-control-plane.io/v1alpha1
kind: ProviderConfig
metadata:
  name: flux
spec:
  versions:
    - version: "2.8.3"
      chartVersion: "2.18.2"
      chartUrl: "oci://ghcr.io/fluxcd-community/charts/flux2"
EOF
```

:::

This controls exactly which versions teams can request in Step 3. Add more entries to the `versions` list to offer additional versions.

:::note Error
You might receive the following error message:

```shell
error: resource mapping not found for name: "flux" namespace: "" from "STDIN": no matches for kind "ProviderConfig" in version "flux.services.open-control-plane.io/v1alpha1"
ensure CRDs are installed first
```
Please wait for a couple of seconds and then try again. Continue when the output says: `providerconfig.flux.services.open-control-plane.io/flux created`.
:::

---

## Step 2: Create a ControlPlane

Now switch to the **end-user perspective**. A team wants their own `ControlPlane`.

First, export the onboarding cluster's kubeconfig so `kubectl` can reach it:

```shell
kind export kubeconfig --name local-onboarding
```

See the [`ControlPlane` reference](/reference/core/controlplane) for the full API.

:::apply-to-onboarding-api

```shell
kubectl config use-context kind-local-onboarding
kubectl apply -f - <<EOF
apiVersion: core.open-control-plane.io/v2alpha1
kind: ControlPlane
metadata:
  name: my-controlplane
  namespace: default
spec:
  iam: {}
EOF
```

Wait for it to become ready:

```shell
kubectl config use-context kind-local-onboarding
kubectl get controlplane my-controlplane -w
```

Once provisioning completes, you will see:

```
NAME              PHASE
my-controlplane   Ready
```
:::

The platform has provisioned an isolated `ControlPlane` cluster. Behind the scenes, OpenControlPlane asked `cluster-provider-kind` to create a new Kind cluster for this `ControlPlane`. The cluster is assigned a generated name of the form `mcp-<hash>.<random>` — for example `mcp-ad2klitc.f52190f9`. The hash is derived from the environment name; the suffix is random per provisioning run. You will need this name in Step 3.

---

## Step 3: Request Flux as a service

The team wants Flux installed on their `ControlPlane`:

:::apply-to-onboarding-api

```shell
kubectl config use-context kind-local-onboarding
kubectl apply -f - <<EOF
apiVersion: flux.services.open-control-plane.io/v1alpha1
kind: Flux
metadata:
  name: my-controlplane
  namespace: default
spec:
  version: 2.8.3
EOF
```

:::

`ServiceProvider` Flux on the platform cluster detects this request and installs Flux into the `ControlPlane` cluster automatically.

### Connect to the ControlPlane cluster

The `ControlPlane` cluster runs as its own Kind cluster with a generated name. Find it:

```shell
kind get clusters
```

```
local-onboarding
local-platform
mcp-ad2klitc.f52190f9     <- your ControlPlane cluster
```

Export its kubeconfig and switch context:

```shell
CONTROLPLANE_CLUSTER=$(kind get clusters | grep '^mcp-')
kind export kubeconfig --name "$CONTROLPLANE_CLUSTER"
kubectl config use-context "kind-$CONTROLPLANE_CLUSTER"
```

### Verify Flux is running

Flux installation can take a few minutes while the `ControlPlane` cluster finishes bootstrapping. Wait for all pods to reach `Running`:

:::apply-to-controlplane

```shell
kubectl get pods -n flux-system
```

```
NAME                                           READY   STATUS    RESTARTS   AGE
helm-controller-8564d95f86-6kxlg               1/1     Running   0          2m8s
image-automation-controller-5c484478c6-jj29p   1/1     Running   0          2m8s
image-reflector-controller-5875745f59-b9cp4    1/1     Running   0          2m8s
kustomize-controller-7587bc49f9-m47nv          1/1     Running   0          2m8s
notification-controller-d7d89cdb9-sht7p        1/1     Running   0          2m8s
source-controller-7f6f4dd77d-vmxvv             1/1     Running   0          2m8s
```

:::

The team now has a fully functional control plane with Flux, provisioned through a simple API request.

---

## Next Steps

### Add more services

Beyond Flux, we can offer [Crossplane](https://www.crossplane.io/), [External Secrets Operator](https://external-secrets.io/), [Velero](https://velero.io/), and more to end users. Each service is a [`ServiceProvider`](/developers/serviceprovider/deploy) deployed on the platform cluster.

Our CLI tool `ocpctl` already pre-installs a lot of these Service Providers. We can look them up via:

:::apply-to-platform

```shell
kubectl config use-context kind-local-platform
kubectl get serviceproviders
```

The output looks like this:

```shell
NAME         PHASE
crossplane   Ready
flux         Ready
kro          Ready
ocm          Ready
```

:::

But we can also apply a new `ServiceProvider` to our platform to offer e.g. External Secrets Operator to end users:

:::apply-to-platform

```shell
kubectl config use-context kind-local-platform
kubectl apply -f - <<EOF
apiVersion: openmcp.cloud/v1alpha1
kind: ServiceProvider
metadata:
  name: externalsecretsoperator
  namespace: openmcp-system
spec:
  image: ghcr.io/openmcp-project/images/service-provider-external-secrets:v1.0.0
EOF
```

We can look up the status of the installation by executing:
```shell
kubectl config use-context kind-local-platform
kubectl get serviceproviders
```

The output looks like this:

```shell
NAME                      PHASE
crossplane                Ready
externalsecretsoperator   Progressing
flux                      Ready
kro                       Ready
ocm                       Ready
```

:::

Next, we need to configure these `ServiceProviders` via their `ProviderConfig` API to rule which versions end users can install.

:::note
MORE COMING SOON
:::


### Managed team access
Learn how [Projects and Workspaces](/users/concepts/projects-and-workspaces) let you organize teams and `ControlPlanes`.

:::note
MORE COMING SOON
:::

### Deploy on real infrastructure

Follow the [Production Setup](./production-setup/00-overview.md) guide to run OpenControlPlane on Gardener.

---

## Clean up

```shell
ocpctl env delete local
```

Removes all Kind clusters and resources created by `ocpctl env apply local`.

