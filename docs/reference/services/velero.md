---
sidebar_position: 3
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# Velero

<div className="crd-header-container">
  <img src="/docs/img/platform/tower_velero.png" alt="Velero" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Delivers Velero as a service for backup and disaster recovery within ManagedControlPlanes.</p>
  </div>
</div>

**API Group:** `velero.services.openmcp.cloud`
**API Version:** `v1alpha1`
**Kind:** `Velero`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-velero/main/api/crds/manifests/velero.services.openmcp.cloud_veleroes.yaml"
  name="Velero"
  description="Velero service provider resource"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-velero/main/config/samples/v1alpha1_velero.yaml"
/>

## Usage

Deploy Velero for backup and recovery:

```yaml
apiVersion: velero.services.openmcp.cloud/v1alpha1
kind: Velero
metadata:
  name: backup-service
  namespace: my-workspace
spec:
  backupStorageLocation:
    provider: aws
    bucket: my-backups
```

The Velero service provider manages backup and disaster recovery capabilities for your control planes.
