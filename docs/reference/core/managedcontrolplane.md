---
sidebar_position: 1
id: managedcontrolplane
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# ManagedControlPlaneV2

<div className="crd-header-container">
  <img src="/docs/img/cp2.png" alt="ManagedControlPlane" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>The primary resource for creating and managing control planes in OpenControlPlane. Supports IAM configuration with OIDC and token-based authentication.</p>
  </div>
</div>

**API Group:** `core.openmcp.cloud`
**API Version:** `v2alpha1`
**Kind:** `ManagedControlPlaneV2`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/openmcp-operator/main/api/crds/manifests/core.openmcp.cloud_managedcontrolplanev2s.yaml"
  name="ManagedControlPlaneV2"
  description="Control plane management with IAM configuration"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/openmcp-operator/main/internal/controllers/managedcontrolplane/testdata/test-01/onboarding/mcp-01.yaml"
/>

## Usage

Create a managed control plane with IAM configuration:

```yaml
apiVersion: core.openmcp.cloud/v2alpha1
kind: ManagedControlPlaneV2
metadata:
  name: my-controlplane
  namespace: default
spec:
  iam:
    oidc:
      defaultProvider:
        roleBindings:
          - role: cluster-admin
```

Access the control plane after creation using the kubeconfig from the status field.
