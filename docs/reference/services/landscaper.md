---
sidebar_position: 2
id: landscaper
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# Landscaper

<div className="crd-header-container">
  <img src="/img/platform/tower_landscaper.png" alt="Landscaper" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Delivers Landscaper as a service within ControlPlanes, enabling declarative deployment orchestration.</p>
  </div>
</div>

**API Group:** `landscaper.services.open-control-plane.io`
**API Version:** `v1alpha2`
**Kind:** `Landscaper`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-landscaper/main/api/crds/manifests/landscaper.services.open-control-plane.io_landscapers.yaml"
  name="Landscaper"
  description="Landscaper service provider resource"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-landscaper/main/docs/resources/landscaper.yaml"
/>

## Usage

Deploy Landscaper within a control plane:

```yaml
apiVersion: landscaper.services.open-control-plane.io/v1alpha2
kind: Landscaper
metadata:
  name: my-landscaper
  namespace: my-workspace
spec:
  version: "v0.50.0"
  components:
    - name: core
      enabled: true
```

The Landscaper service provider manages the installation and configuration of Landscaper for deployment orchestration.
