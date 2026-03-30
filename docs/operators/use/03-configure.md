---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use Control Plane

This guide shows you how to install managed services in your ControlPlane to extend its functionality.

## Install Managed Services

:::note Availability
The services you can install depend on what your platform operator has configured and made available. If a service isn't working, contact your operator to enable it. [Learn more about Service Providers →](/docs/users/concepts/service-provider)
:::

You can install managed services in your ControlPlane to add capabilities like infrastructure management and workload orchestration.

<Tabs>
<TabItem value="crossplane" label="Crossplane" default>

<div className="crd-header-container">
  <img src="/docs/img/platform/tower_crossplane.png" alt="Crossplane" className="crd-header-icon" />
  <div className="crd-header-text">
    <p><a href="https://www.crossplane.io/">Crossplane</a> enables you to manage cloud infrastructure using Kubernetes-style declarative configuration.</p>
  </div>
</div>

To install Crossplane, create a `Crossplane` resource in the same namespace as your ControlPlane:

```yaml
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: Crossplane
metadata:
  name: my-controlplane
  namespace: project-platform-team--ws-dev
spec:
  version: v1.17.0
  providers:
    - name: provider-kubernetes
      version: v0.14.0
    - name: provider-aws
      version: v1.17.0
    - name: provider-azure
      version: v1.11.0
```

The `name` must match your ControlPlane name. Add any Crossplane providers you need in the `providers` array.

```bash
kubectl apply -f crossplane.yaml
```

</TabItem>
<TabItem value="landscaper" label="Landscaper">

<div className="crd-header-container">
  <img src="/docs/img/platform/tower_landscaper.png" alt="Landscaper" className="crd-header-icon" />
  <div className="crd-header-text">
    <p><a href="https://github.com/gardener/landscaper">Landscaper</a> manages the installation, updates, and uninstallation of cloud-native workloads with complex dependency chains.</p>
  </div>
</div>

To install Landscaper, create a `Landscaper` resource:

```yaml
apiVersion: landscaper.services.openmcp.cloud/v1alpha2
kind: Landscaper
metadata:
  name: my-controlplane
  namespace: project-platform-team--ws-dev
spec:
  version: v0.142.0
```

```bash
kubectl apply -f landscaper.yaml
```

</TabItem>
<TabItem value="velero" label="Velero">

<div className="crd-header-container">
  <img src="/docs/img/platform/tower_velero.png" alt="Velero" className="crd-header-icon" />
  <div className="crd-header-text">
    <p><a href="https://velero.io/">Velero</a> provides backup and disaster recovery capabilities for your Kubernetes workloads.</p>
  </div>
</div>

To install Velero, create a `Velero` resource:

```yaml
apiVersion: velero.services.openmcp.cloud/v1alpha1
kind: Velero
metadata:
  name: my-controlplane
  namespace: project-platform-team--ws-dev
spec:
  version: v1.15.0
  backupStorageLocations:
    - name: default
      provider: aws
      bucket: my-backup-bucket
```

```bash
kubectl apply -f velero.yaml
```

</TabItem>
<TabItem value="kyverno" label="Kyverno (Coming Soon)">

<div className="crd-header-container">
  <img src="/docs/img/logos/kyverno.png" alt="Kyverno" className="crd-header-icon" />
  <div className="crd-header-text">
    <p><a href="https://kyverno.io/">Kyverno</a> enables policy management and governance for your Kubernetes resources.</p>
  </div>
</div>

:::info Coming Soon
Kyverno service provider is currently under development. Check the [service provider examples](/docs/developers/serviceprovider/examples) for progress.
:::

</TabItem>
<TabItem value="flux" label="Flux (Coming Soon)">

<div className="crd-header-container">
  <img src="/docs/img/logos/flux.png" alt="Flux" className="crd-header-icon" />
  <div className="crd-header-text">
    <p><a href="https://fluxcd.io/">Flux</a> provides GitOps continuous delivery for your Kubernetes workloads.</p>
  </div>
</div>

:::info Coming Soon
Flux service provider is currently under development. Check the [service provider examples](/docs/developers/serviceprovider/examples) for progress.
:::

</TabItem>
<TabItem value="external-secrets" label="External Secrets (Coming Soon)">

<div className="crd-header-container">
  <img src="/docs/img/logos/external-secrets.png" alt="External Secrets" className="crd-header-icon" />
  <div className="crd-header-text">
    <p><a href="https://external-secrets.io/">External Secrets Operator</a> integrates external secret management systems for secure secret handling.</p>
  </div>
</div>

:::info Coming Soon
External Secrets service provider is currently under development. Check the [service provider examples](/docs/developers/serviceprovider/examples) for progress.
:::

</TabItem>
</Tabs>

---

## Next Steps

Congratulations! You have a working ControlPlane with managed services. Here's what you can explore next:

- **[What is a Managed Control Plane?](/docs/users/concepts/managed-control-plane)** — Deeper understanding of ControlPlanes
- **[Service Providers](/docs/users/concepts/service-provider)** — How managed services work
- **[Crossplane Service Provider](https://github.com/openmcp-project/service-provider-crossplane)** — Manage cloud infrastructure
- **[Landscaper Service Provider](https://github.com/openmcp-project/service-provider-landscaper)** — Orchestrate complex workloads
