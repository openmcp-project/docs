---
sidebar_position: 5
id: kro
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# Kro

<div className="crd-header-container">
  <img src="/docs/img/platform/tower.png" alt="Kro" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Delivers Kro (Kube Resource Orchestrator) as a service within ManagedControlPlanes, enabling custom Kubernetes APIs composed from existing resources.</p>
  </div>
</div>

**API Group:** `kro.services.openmcp.cloud`
**API Version:** `v1alpha1`
**Kind:** `Kro`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-kro/main/api/crds/manifests/kro.services.openmcp.cloud_kroes.yaml"
  name="Kro"
  description="Kro service provider resource"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-kro/main/test/e2e/onboarding/kro.yaml"
/>

## Usage

Deploy Kro within a control plane:

```yaml
apiVersion: kro.services.openmcp.cloud/v1alpha1
kind: Kro
metadata:
  name: my-controlplane
  namespace: project-platform-team--ws-dev
spec:
  version: 0.9.1
```

The Kro service provider installs the [Kro](https://kro.run) controller into the `kro-system` namespace on your ManagedControlPlane via a Flux `HelmRelease`. The chart source, image pull secret, and Helm values are configured cluster-wide through the `ProviderConfig` maintained by the platform operator.

The name of the `Kro` resource **must** match the name of your ManagedControlPlane. This guarantees a single Kro installation per control plane.
