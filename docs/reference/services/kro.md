---
sidebar_position: 5
id: kro
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# kro

<div className="crd-header-container">
  <img src="/img/platform/tower_kro.png" alt="kro" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Delivers kro as a service within ManagedControlPlanes, enabling declarative, multi-resource Kubernetes abstractions through the ResourceGraphDefinition CRD.</p>
  </div>
</div>

**API Group:** `kro.services.openmcp.cloud`
**API Version:** `v1alpha1`
**Kind:** `Kro`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-kro/main/api/crds/manifests/kro.services.openmcp.cloud_kroes.yaml"
  name="kro"
  description="kro service provider resource"
/>

## Usage

Deploy kro within a control plane:

```yaml
apiVersion: kro.services.openmcp.cloud/v1alpha1
kind: Kro
metadata:
  name: my-kro
  namespace: my-workspace
spec:
  version: 0.9.2
```

The kro service provider installs and manages [kro](https://kro.run) on workload clusters via Flux HelmReleases.
