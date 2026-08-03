---
sidebar_position: 1
id: usage-kubernetes
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Deploy to Kubernetes

Your `ControlPlane` manages infrastructure — **it does not run your workloads itself**. This page covers how to deploy applications to a **Kubernetes cluster** that is managed by your `ControlPlane` (e.g. a Gardener cluster requested via a `ClusterRequest`).

## Which approach should I use?

| Approach                | Air-gap / Sovereign Cloud   | GitOps | Helm support | Complexity |
| ----------------------- | --------------------------- | ------ | ------------ | ---------- |
| **OCM** ✓ recommended   | Yes — built-in localization | Yes    | Yes          | Medium     |
| **Flux**                | No                          | Yes    | Yes          | Low        |
| **ArgoCD**              | No                          | Yes    | Yes          | Medium     |
| **kubectl / kustomize** | Yes (manual)                | No     | No           | Low        |

**TL;DR**: If you operate in regulated or sovereign-cloud environments, or need to transport components across air-gapped networks, use OCM. For standard internet-connected clusters with simple GitOps needs, Flux is a quick win.

---

## OCM — Recommended

[Open Component Model (OCM)](https://ocm.software/) packages your software as _components_ that can be transferred, signed, and deployed to any environment — including air-gapped and sovereign clouds. The OCM Kubernetes deployer acts as a controller that pulls resources from an OCM repository and applies them to your target cluster.

**Key advantages over other approaches:**
- **Localization** — image references and registry URLs are rewritten at transfer time, enabling deployment to sovereign clouds without manual manifest patching. See [transfer & transport](https://ocm.software/docs/concepts/transfer-and-transport/).
- **Verification** — components can be signed and verified before deployment.
- **Air-gap support** — `ocm transfer` moves a component to any OCI registry, including on-premise ones.

### Prerequisite

Install the OCM operator on your `ControlPlane` — see [Configure → OCM](../getting-started/configure). The OCM operator running on the `ControlPlane` then manages deployments to the target cluster on your behalf. More details on [how to build OCM Artifacts](https://ocm.software/docs/how-to/deploy-manifests-with-deployer/).

### Deploy a plain Kubernetes resource

```yaml
# 1. Point to an OCM repository
apiVersion: delivery.ocm.software/v1alpha1
kind: Repository
metadata:
  name: my-registry
  namespace: default
spec:
  interval: 1h
  repositorySpec:
    baseUrl: ghcr.io/my-org/ocm
    type: OCIRegistry
---
# 2. Select a component version
apiVersion: delivery.ocm.software/v1alpha1
kind: Component
metadata:
  name: my-app
  namespace: default
spec:
  component: github.com/my-org/my-app
  downgradePolicy: "Deny"
  semver: "1.0.0"
  interval: 1h
  repositoryRef:
    name: my-registry
---
# 3. Reference the resource inside the component
apiVersion: delivery.ocm.software/v1alpha1
kind: Resource
metadata:
  name: my-app-manifests
  namespace: default
spec:
  componentRef:
    name: my-app
  resource:
    byReference:
      resource:
        name: manifest
---
# 4. Apply it to the target cluster
apiVersion: delivery.ocm.software/v1alpha1
kind: Deployer
metadata:
  name: my-app-deployer
  namespace: default
spec:
  resourceRef:
    name: my-app-manifests
    namespace: default
```

### Deploy a kro ResourceGraphDefinition via OCM

Package a [kro](https://kro.run) `ResourceGraphDefinition` as an OCM resource. The deployer applies the definition, and kro reconciles it into a custom CRD your platform users can instantiate:

```yaml
apiVersion: delivery.ocm.software/v1alpha1
kind: Resource
metadata:
  name: my-platform-api
  namespace: default
spec:
  componentRef:
    name: my-platform
  resource:
    byReference:
      resource:
        name: resource-graph-definition  # kro RGD packaged as OCM resource
---
apiVersion: delivery.ocm.software/v1alpha1
kind: Deployer
metadata:
  name: my-platform-api-deployer
  namespace: default
spec:
  resourceRef:
    name: my-platform-api
    namespace: default
```

Once applied, users can create instances of the generated CRD as if it were a native Kubernetes resource.

---

## Flux — Traditional GitOps

[Flux](https://fluxcd.io/) keeps a cluster in sync with a Git repository. It's well understood and easy to get started with.

### Prerequisite

Install Flux on your `ControlPlane` — see [Configure → Flux](../getting-started/configure). Flux runs on the `ControlPlane` and reconciles resources onto the target cluster.

### GitRepository + HelmRelease

```yaml
# 1. Point Flux at your Git repo
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: my-app
  namespace: flux-system
spec:
  interval: 5m
  url: https://github.com/my-org/my-app
  ref:
    branch: main
---
# 2. Install a Helm chart from that repo
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: my-app
  namespace: default
spec:
  interval: 10m
  chart:
    spec:
      chart: ./charts/my-app
      sourceRef:
        kind: GitRepository
        name: my-app
        namespace: flux-system
  values:
    replicaCount: 2
```

:::warning No localization for sovereign clouds
Flux pulls images and manifests directly from the upstream source. It has no built-in mechanism to rewrite registry references when deploying to air-gapped or sovereign-cloud environments. If you need to move software across network boundaries, consider OCM instead — it handles [transfer and localization](https://ocm.software/docs/concepts/transfer-and-transport/) natively.
:::

---

## ArgoCD

[ArgoCD](https://argoproj.github.io/cd/) provides a full GitOps UI and RBAC model on top of Git-driven deployments.

:::note
ArgoCD does not currently have a managed service provider in OpenControlPlane. Install it manually on your `ControlPlane` as you would on any Kubernetes cluster.
:::

Install ArgoCD on your `ControlPlane` via `kubectl` or Helm, then create an `Application`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/my-org/my-app
    targetRevision: main
    path: manifests/
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

---

## Summary

- **Start with OCM** if you need portability, signing, or sovereign-cloud support.
- **Use Flux** for simple GitOps on internet-connected clusters where air-gap is not a concern.
- **Use ArgoCD** if your team prefers a UI-driven GitOps workflow.
