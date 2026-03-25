---
sidebar_position: 1
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# Crossplane

<div className="crd-header-container">
  <img src="/docs/img/platform/tower_crossplane.png" alt="Crossplane" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Delivers Crossplane as a service within ManagedControlPlanes, enabling infrastructure provisioning through composition.</p>
  </div>
</div>

**API Group:** `crossplane.services.openmcp.cloud`
**API Version:** `v1alpha1`
**Kind:** `Crossplane`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-crossplane/main/api/crds/manifests/crossplane.services.openmcp.cloud_crossplanes.yaml"
  name="Crossplane"
  description="Crossplane service provider resource"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-crossplane/main/config/samples/v1alpha1_crossplane.yaml"
/>

## Usage

Deploy Crossplane within a control plane:

```yaml
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: Crossplane
metadata:
  name: my-crossplane
  namespace: my-workspace
spec:
  crossplaneVersion: "1.14.0"
  providerConfigs:
    - name: default
```

The Crossplane service provider manages the installation and lifecycle of Crossplane and its providers within your control plane.
