---
sidebar_position: 1
id: serviceprovider
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# ServiceProvider

<div className="crd-header-container">
  <img src="/docs/img/platform/tower.png" alt="ServiceProvider" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Delivers consumable services to customers via ManagedControlPlanes. Service providers enable platform operators to offer managed services to end users.</p>
  </div>
</div>

**API Group:** `openmcp.cloud`
**API Version:** `v1alpha1`
**Kind:** `ServiceProvider`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/openmcp-operator/main/api/crds/manifests/openmcp.cloud_serviceproviders.yaml"
  name="ServiceProvider"
  description="Service delivery configuration"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/openmcp-operator/main/internal/controllers/managedcontrolplane/testdata/test-01/platform/sp-01.yaml"
/>

## Related Resources

- [Build a Service Provider](/developers/serviceprovider/develop)
- [Service Provider Examples](/developers/serviceprovider/examples)
