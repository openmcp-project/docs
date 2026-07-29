---
sidebar_position: 3
id: external-secrets
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# External Secrets Operator

<div className="crd-header-container">
  <img src="/img/platform/tower.png" alt="External Secrets Operator" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Delivers the External Secrets Operator as a service within ControlPlanes, enabling secrets synchronisation from external vaults.</p>
  </div>
</div>

**API Group:** `external-secrets.services.open-control-plane.io`
**API Version:** `v1alpha1`
**Kind:** `ExternalSecretsOperator`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-external-secrets/main/api/crds/manifests/external-secrets.services.open-control-plane.io_externalsecretsoperators.yaml"
  name="ExternalSecretsOperator"
  description="External Secrets Operator service provider resource"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-external-secrets/main/test/e2e/onboarding/eso-mcp-a.yaml"
/>

## Usage

Deploy the External Secrets Operator within a control plane:

```yaml
apiVersion: external-secrets.services.open-control-plane.io/v1alpha1
kind: ExternalSecretsOperator
metadata:
  name: my-eso
  namespace: my-workspace
spec:
  version: "v2.1.0"
```

The External Secrets Operator service provider manages the installation and lifecycle of ESO within your control plane, enabling workloads to synchronise secrets from external providers such as AWS Secrets Manager, HashiCorp Vault, and Azure Key Vault.
