---
sidebar_position: 2
id: projects-and-workspaces
---

# Projects and Workspaces

Projects and Workspaces are the way OpenControlPlane organizes teams and their `ControlPlanes`.

- A **`Project`** is a logical grouping of `ControlPlanes` that belong to a team or business unit. It provides a namespace boundary and access control scope.
- A **`Workspace`** is a named environment within a Project — for example `dev`, `staging`, or `prod`. Each Workspace can contain multiple `ControlPlanes`.

This gives teams a clear structure to organize their control planes by environment or purpose.

- **End users** create `ControlPlanes` within their team's Project and Workspace. → [Getting started](/users/getting-started)
- **Operators** set up Projects and Workspaces as part of platform onboarding. → [Operator guide](/operators/overview)

**CRD Reference:** [`Project`](/reference/core/project) · [`Workspace`](/reference/core/workspace)

:::note
Full documentation for Projects and Workspaces is coming soon. User management via Projects and Workspaces will be covered in the [Production Setup](/operators/production-setup/production-overview) section.
:::
