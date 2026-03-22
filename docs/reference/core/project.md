---
sidebar_position: 2
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# Project

Organizational unit for grouping workspaces and managing resources across teams. Projects provide multi-tenancy and resource isolation.

**API Group:** `core.openmcp.cloud`
**API Version:** `v1alpha1`
**Kind:** `Project`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/project-workspace-operator/main/api/crds/manifests/core.openmcp.cloud_projects.yaml"
  name="Project"
  description="Project resource for multi-tenancy"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/project-workspace-operator/main/config/samples/_v1alpha1_project.yaml"
/>

## Usage

Create a project to organize workspaces and resources:

```yaml
apiVersion: core.openmcp.cloud/v1alpha1
kind: Project
metadata:
  name: my-project
spec:
  displayName: "My Project"
  description: "Project for team resources"
```

Projects can contain multiple workspaces and provide namespace isolation for different teams or applications.
