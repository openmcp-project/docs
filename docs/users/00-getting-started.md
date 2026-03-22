---
sidebar_position: 0
---

# Welcome

OpenControlPlane is a platform that lets you create and manage Kubernetes-based control planes for your teams. Think of it as a way to deliver cloud services to your organization—everything from databases and message queues to CI/CD pipelines and monitoring tools—all through a unified Kubernetes API.

:::info Prerequisites
Requires a deployed OpenControlPlane platform. Operators: see [setup guide](/operators/setup) → [verify setup](/operators/verify-setup).
:::

## What You'll Learn

This guide will help you understand and use OpenControlPlane effectively:

### Getting Started

Learn the basics of working with OpenControlPlane:
- **[Onboarding](./getting-started/onboard)** - Create your first project and workspace
- **[Connect](./getting-started/connect)** - Access your control plane
- **[Configure](./getting-started/configure)** - Set up services and resources

### Core Concepts

Understand the building blocks:
- **[Managed Control Plane](./concepts/managed-control-plane)** - Your dedicated Kubernetes API server
- **[Projects & Workspaces](./concepts/managed-control-plane)** - Organize teams and environments
- **[Service Providers](./concepts/service-provider)** - Deploy services like Crossplane or Landscaper

### Ecosystem

Explore the [open-source projects](./ecosystem) that power OpenControlPlane, including Kubernetes, Crossplane, Gardener, and Landscaper.

## Quick Navigation

<div className="reference-grid">

<div className="reference-card reference-card-compact">
  <h3>New User?</h3>
  <p>Start with our step-by-step onboarding guide.</p>
  <a href="/users/getting-started/onboard" className="reference-link">Get Started →</a>
</div>

<div className="reference-card reference-card-compact">
  <h3>Learn Concepts</h3>
  <p>Understand how OpenControlPlane works.</p>
  <a href="/users/concepts/managed-control-plane" className="reference-link">Core Concepts →</a>
</div>

<div className="reference-card reference-card-compact">
  <h3>Browse CRDs</h3>
  <p>Explore the complete API reference with examples.</p>
  <a href="/reference/overview" className="reference-link">CRD Browser →</a>
</div>

</div>

## Need Help?

- **Community**: Join our [community hub](/community/overview) to connect with other users
- **GitHub**: Report issues or browse repositories at [openmcp-project](https://github.com/openmcp-project)
- **Support**: Check the [contributing guide](https://github.com/openmcp-project/community/blob/main/CONTRIBUTING.md) for ways to get help

---

Ready to get started? Head to the [onboarding guide](./getting-started/onboard) to create your first control plane.
