---
sidebar_position: 0
id: concepts-overview
slug: /users/concepts
---

# Overview

This section explains the core building blocks of OpenControlPlane. Reading through these pages will give you a solid mental model before diving into the guides.

## [Control Planes](./controlplane.md)

<img src="/img/cp2.png" alt="ControlPlane" style={{maxWidth: '80px', float: 'right', marginLeft: '16px'}} />

The central resource in OpenControlPlane. A Managed Control Plane is a lightweight Kubernetes cluster that stores the desired state of your resources — managed through standard Kubernetes tooling.

**→** [End user guide](/users/getting-started) · [CRD reference](/reference/core/controlplane)

<div style={{clear: 'both'}} />

## [Projects and Workspaces](./projects-and-workspaces.md)

How OpenControlPlane organizes teams and their control planes. Projects group control planes by team or business unit; Workspaces represent environments like `dev`, `staging`, or `prod`.

**→** [Project CRD](/reference/core/project) · [Workspace CRD](/reference/core/workspace)

## [Providers](./providers.md)

<img src="/img/provider_types.png" alt="Provider types" style={{maxWidth: '160px', float: 'right', marginLeft: '16px'}} />

The three provider types that extend an OpenControlPlane environment: **Service Providers** add capabilities to individual control planes, **Platform Services** add system-wide infrastructure, and **Cluster Providers** manage the underlying Kubernetes clusters.

**→** [Operator guide](/operators/overview) · [Developer guide](/developers/overview) · [Contribute](https://github.com/openmcp-project/community)

<div style={{clear: 'both'}} />
