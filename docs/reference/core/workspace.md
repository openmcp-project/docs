---
sidebar_position: 3
slug: /reference/core/workspace
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# Workspace

<div className="crd-header-container">
  <div className="crd-header-icon-custom">
    <div className="reference-icon-group reference-icon-group-workspace">
      <img src="/docs/img/cp2.png" alt="" className="reference-icon-medium reference-icon-left" />
      <img src="/docs/img/cp3.png" alt="" className="reference-icon-medium reference-icon-right" />
    </div>
    <div className="reference-icon-label">dev</div>
  </div>
  <div className="crd-header-text">
    <p>Isolated environment within a project for deploying and managing applications. Workspaces provide dedicated namespaces and resource quotas.</p>
  </div>
</div>

**API Group:** `core.openmcp.cloud`
**API Version:** `v1alpha1`
**Kind:** `Workspace`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/project-workspace-operator/main/api/crds/manifests/core.openmcp.cloud_workspaces.yaml"
  name="Workspace"
  description="Workspace resource for environment isolation"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/project-workspace-operator/main/config/samples/_v1alpha1_workspace.yaml"
/>

## Usage

Create a workspace within a project:

```yaml
apiVersion: core.openmcp.cloud/v1alpha1
kind: Workspace
metadata:
  name: development
  namespace: my-project
spec:
  displayName: "Development Environment"
  description: "Workspace for development workloads"
```

Workspaces are namespace-scoped and belong to a project. They provide isolated environments for different stages of your application lifecycle (dev, staging, production).
