---
sidebar_position: 4
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# OCM

<div className="crd-header-container">
  <img src="/docs/img/platform/tower.png" alt="OCM" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Delivers the Open Component Model (OCM) as a service within ManagedControlPlanes, enabling secure software delivery and deployment at any scale.</p>
  </div>
</div>

**API Group:** `ocm.services.openmcp.cloud`
**API Version:** `v1alpha1`
**Kind:** `OCM`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/open-component-model/service-provider-ocm/main/api/crds/manifests/ocm.services.openmcp.cloud_ocms.yaml"
  name="OCM"
  description="OCM service provider resource"
  exampleUrl="https://raw.githubusercontent.com/open-component-model/service-provider-ocm/main/config/samples/v1alpha1_ocm.yaml"
/>

## Usage

Deploy OCM within a control plane:

```yaml
apiVersion: ocm.services.openmcp.cloud/v1alpha1
kind: OCM
metadata:
  name: my-controlplane
  namespace: project-platform-team--ws-dev
spec:
  version: 0.3.0
```

The OCM service provider manages the `ocm-k8s-toolkit` controller deployment on your ManagedControlPlane, enabling secure software delivery using the Open Component Model.

The base installation comes with minimal RBAC settings. To extend permissions, follow the [custom RBAC for OCM](https://github.com/open-component-model/open-component-model/blob/main/kubernetes/controller/docs/getting-started/custom-rbac.md) guide.
