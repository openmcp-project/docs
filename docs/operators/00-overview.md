---
sidebar_position: 0
id: overview
---

# Overview

As a platform operator, you deploy and manage OpenControlPlane so your teams can self-serve managed `ControlPlanes`. You configure the providers that back those `ControlPlanes` and the services that run on them. Your teams interact with the platform through a simple Kubernetes API.

## Your Journey

**Trying it out locally?**
The [Quickstart](./quickstart) gets you a full local platform in under 10 minutes using `ocpctl`. No infrastructure required.

**Deploying to production?**
The [Production Setup](./production-setup/00-overview.md) section covers deploying on real infrastructure with Gardener.

## What You'll Be Able to Do

- Provision isolated Kubernetes `ControlPlanes` for your teams on demand
- Offer services (Flux, Crossplane, ESO, and more) that teams can request through a Kubernetes API
- Manage team access through Projects and Workspaces, organizing `ControlPlanes` by team and environment

## Quick Navigation

<div className="reference-grid">

<div className="reference-card reference-card-compact">
  <h3>Quickstart</h3>
  <p>Get a local platform running in under 10 minutes.</p>
  <a href="/operators/quickstart" className="reference-link">Get Started →</a>
</div>

<div className="reference-card reference-card-compact">
  <h3>Production Setup</h3>
  <p>Deploy on real infrastructure with Gardener.</p>
  <a href="/operators/production-setup/production-overview" className="reference-link">Production Setup →</a>
</div>

<div className="reference-card reference-card-compact">
  <h3>How-To Guides</h3>
  <p>Step-by-step instructions for common tasks.</p>
  <a href="/operators/how-to-guides/custom-ca" className="reference-link">How-To Guides →</a>
</div>

</div>
