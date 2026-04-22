---
sidebar_position: 2
slug: /reference/services/landscaper
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# Landscaper

<div className="crd-header-container">
  <img src="/docs/img/platform/tower_landscaper.png" alt="Landscaper" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Delivers Landscaper as a service within ManagedControlPlanes, enabling declarative deployment orchestration.</p>
  </div>
</div>

**API Group:** `landscaper.services.openmcp.cloud`
**API Version:** `v1alpha2`
**Kind:** `Landscaper`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-landscaper/main/api/crds/manifests/landscaper.services.openmcp.cloud_landscapers.yaml"
  name="Landscaper"
  description="Landscaper service provider resource"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-landscaper/main/config/samples/v1alpha2_landscaper.yaml"
/>

## Usage

Deploy Landscaper within a control plane:

```yaml
apiVersion: landscaper.services.openmcp.cloud/v1alpha2
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
