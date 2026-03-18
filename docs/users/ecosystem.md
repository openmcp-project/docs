---
sidebar_position: 2
---

# Ecosystem

OpenControlPlane is built on top of amazing open-source projects from the cloud native ecosystem. Here are the key projects that power our platform.

<div className="ecosystem-grid">

<div className="project-card">
  <div className="project-card-header">
    <img src="/img/logos/kubernetes.png" alt="Kubernetes" className="project-logo" />
    <h3>Kubernetes</h3>
  </div>
  <div className="project-description">
    The foundation of OpenControlPlane. We extend the Kubernetes API through Custom Resource Definitions (CRDs), enabling you to configure infrastructure, services, and applications using the same familiar API.
  </div>
  <div className="project-links">
    <a href="https://kubernetes.io/" className="project-link project-link-primary" target="_blank" rel="noopener noreferrer">
      Website
    </a>
    <a href="https://github.com/kubernetes/kubernetes" className="project-link project-link-secondary" target="_blank" rel="noopener noreferrer">
      GitHub
    </a>
  </div>
</div>

<div className="project-card">
  <div className="project-card-header">
    <img src="/img/logos/crossplane.png" alt="Crossplane" className="project-logo" />
    <h3>Crossplane</h3>
  </div>
  <div className="project-description">
    A CNCF project that orchestrates anything through Kubernetes. Enable Crossplane as a service provider to give your users access to the rich ecosystem of Crossplane providers.
  </div>
  <div className="project-links">
    <a href="https://crossplane.io/" className="project-link project-link-primary" target="_blank" rel="noopener noreferrer">
      Website
    </a>
    <a href="https://github.com/crossplane/crossplane" className="project-link project-link-secondary" target="_blank" rel="noopener noreferrer">
      GitHub
    </a>
  </div>
</div>

<div className="project-card">
  <div className="project-card-header">
    <img src="/img/logos/gardener.png" alt="Gardener" className="project-logo" />
    <h3>Gardener</h3>
  </div>
  <div className="project-description">
    Delivers fully-managed Kubernetes clusters at scale across AWS, Azure, GCP, OpenStack, and more. Use Gardener as a cluster provider in OpenControlPlane for automated cluster management.
  </div>
  <div className="project-links">
    <a href="https://gardener.cloud/" className="project-link project-link-primary" target="_blank" rel="noopener noreferrer">
      Website
    </a>
    <a href="https://github.com/gardener/gardener" className="project-link project-link-secondary" target="_blank" rel="noopener noreferrer">
      GitHub
    </a>
  </div>
</div>

<div className="project-card">
  <div className="project-card-header">
    <img src="/img/logos/flux.png" alt="Flux" className="project-logo" />
    <h3>Flux</h3>
  </div>
  <div className="project-description">
    Continuous and progressive delivery for Kubernetes. Enable Flux to provide GitOps capabilities in your Managed Control Planes, allowing declarative infrastructure management from Git.
  </div>
  <div className="project-links">
    <a href="https://fluxcd.io/" className="project-link project-link-primary" target="_blank" rel="noopener noreferrer">
      Website
    </a>
    <a href="https://github.com/fluxcd/flux2" className="project-link project-link-secondary" target="_blank" rel="noopener noreferrer">
      GitHub
    </a>
  </div>
</div>

<div className="project-card">
  <div className="project-card-header">
    <img src="/img/logos/kyverno.png" alt="Kyverno" className="project-logo" />
    <h3>Kyverno</h3>
  </div>
  <div className="project-description">
    Policy-as-Code for Kubernetes and cloud native environments. Define team-internal and organization-wide policies to establish security standards and corporate compliance requirements.
  </div>
  <div className="project-links">
    <a href="https://kyverno.io/" className="project-link project-link-primary" target="_blank" rel="noopener noreferrer">
      Website
    </a>
    <a href="https://github.com/kyverno/kyverno" className="project-link project-link-secondary" target="_blank" rel="noopener noreferrer">
      GitHub
    </a>
  </div>
</div>

<div className="project-card">
  <div className="project-card-header">
    <img src="/img/logos/external-secrets.png" alt="External Secrets" className="project-logo" />
    <h3>External Secrets</h3>
  </div>
  <div className="project-description">
    Integrates external secret management systems like AWS Secrets Manager, HashiCorp Vault, and more. Automatically sync secrets into Kubernetes or push generated secrets to external systems.
  </div>
  <div className="project-links">
    <a href="https://external-secrets.io/" className="project-link project-link-primary" target="_blank" rel="noopener noreferrer">
      Website
    </a>
    <a href="https://github.com/external-secrets/external-secrets" className="project-link project-link-secondary" target="_blank" rel="noopener noreferrer">
      GitHub
    </a>
  </div>
</div>

<div className="project-card">
  <div className="project-card-header">
    <img src="/img/logos/ocm.png" alt="Open Component Model" className="project-logo" />
    <h3>Open Component Model</h3>
  </div>
  <div className="project-description">
    An open standard for describing software artifacts and lifecycle metadata in a technology-agnostic way. Used by OpenControlPlane to package and deliver components reliably to any environment.
  </div>
  <div className="project-links">
    <a href="https://ocm.software/" className="project-link project-link-primary" target="_blank" rel="noopener noreferrer">
      Website
    </a>
    <a href="https://github.com/open-component-model" className="project-link project-link-secondary" target="_blank" rel="noopener noreferrer">
      GitHub
    </a>
  </div>
</div>

<div className="project-card">
  <div className="project-card-header">
    <img src="/img/logos/landscaper.png" alt="Landscaper" className="project-logo" />
    <h3>Landscaper</h3>
  </div>
  <div className="project-description">
    Describes, installs, and maintains cloud-native landscapes. Activate as a service provider to simplify the rollout of complex software products for your users with declarative installations.
  </div>
  <div className="project-links">
    <a href="https://github.com/gardener/landscaper" className="project-link project-link-primary" target="_blank" rel="noopener noreferrer">
      GitHub
    </a>
    <a href="https://github.com/gardener/landscaper/blob/master/docs/README.md" className="project-link project-link-secondary" target="_blank" rel="noopener noreferrer">
      Docs
    </a>
  </div>
</div>

</div>

## Why These Projects?

All of these projects share OpenControlPlane's commitment to:

- **Open Standards**: Built on Kubernetes and cloud native principles
- **Extensibility**: Designed to be extended and customized
- **Declarative Management**: Infrastructure and services as code
- **Community-Driven**: Active CNCF and open-source communities

By building on these proven foundations, OpenControlPlane provides a robust, scalable platform for managing your cloud infrastructure and services.
