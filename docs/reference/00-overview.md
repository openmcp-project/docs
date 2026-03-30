---
sidebar_position: 1
---

# CRD Reference

Browse the Custom Resource Definitions (CRDs) that power OpenControlPlane. Each CRD has its own dedicated page with an interactive schema viewer, real examples, and complete definitions.

## End User Resources

Resources that end users interact with to consume platform capabilities.

<div className="reference-grid">

<div className="reference-card">
  <div className="reference-icon-container reference-icon-container-standard">
    <img src="/docs/img/cp2.png" alt="ManagedControlPlane" className="reference-icon-large" />
  </div>
  <h3>ManagedControlPlaneV2</h3>
  <p>The primary resource for creating and managing control planes in OpenControlPlane.</p>
  <a href="/docs/reference/core/managedcontrolplane" className="reference-link">View CRD →</a>
  <a href="/docs/users/concepts/managed-control-plane" className="reference-link-secondary">Learn Concept</a>
  <a href="https://github.com/openmcp-project/openmcp-operator/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

<div className="reference-card">
  <div className="reference-icon-container">
    <div className="reference-icon-group reference-icon-group-workspace">
      <img src="/docs/img/cp2.png" alt="" className="reference-icon-medium reference-icon-left" />
      <img src="/docs/img/cp3.png" alt="" className="reference-icon-medium reference-icon-right" />
    </div>
    <div className="reference-icon-label">dev</div>
  </div>
  <h3>Workspace</h3>
  <p>Isolated environment within a project for deploying and managing applications.</p>
  <a href="/docs/reference/core/workspace" className="reference-link">View CRD →</a>
  <a href="/docs/users/concepts/managed-control-plane#workspace" className="reference-link-secondary">Learn Concept</a>
  <a href="https://github.com/openmcp-project/project-workspace-operator/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

<div className="reference-card">
  <div className="reference-icon-container">
    <div className="reference-icon-project-container">
      <div className="reference-icon-workspace-mini reference-icon-workspace-dev">
        <img src="/docs/img/cp1.png" alt="" className="reference-icon-small reference-icon-left" />
        <img src="/docs/img/cp2.png" alt="" className="reference-icon-small reference-icon-right" />
        <div className="reference-icon-label-mini">dev</div>
      </div>
      <div className="reference-icon-workspace-mini reference-icon-workspace-prod">
        <img src="/docs/img/cp3.png" alt="" className="reference-icon-small reference-icon-left" />
        <img src="/docs/img/cp4.png" alt="" className="reference-icon-small reference-icon-right" />
        <div className="reference-icon-label-mini">prod</div>
      </div>
    </div>
    <div className="reference-icon-label">team-project</div>
  </div>
  <h3>Project</h3>
  <p>Organizational unit for grouping workspaces and managing resources across teams.</p>
  <a href="/docs/reference/core/project" className="reference-link">View CRD →</a>
  <a href="/docs/users/concepts/managed-control-plane#project" className="reference-link-secondary">Learn Concept</a>
  <a href="https://github.com/openmcp-project/project-workspace-operator/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

<div className="reference-card">
  <div className="reference-icon-container reference-icon-container-standard">
    <img src="/docs/img/platform/tower.png" alt="ServiceProvider" className="reference-icon-large" />
  </div>
  <h3>ServiceProvider</h3>
  <p>Delivers consumable services to customers via ManagedControlPlanes.</p>
  <a href="/docs/reference/operator/providers/serviceprovider" className="reference-link">View CRD →</a>
  <a href="/docs/users/concepts/service-provider" className="reference-link-secondary">Learn Concept</a>
  <a href="https://github.com/openmcp-project/openmcp-operator/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

</div>

## Service Providers

Available service providers that can be deployed within control planes.

<div className="reference-grid">

<div className="reference-card">
  <div className="reference-icon-container reference-icon-container-standard">
    <img src="/docs/img/platform/tower_crossplane.png" alt="Crossplane" className="reference-icon-large" />
  </div>
  <h3>Crossplane</h3>
  <p>Infrastructure provisioning and composition service using Crossplane.</p>
  <a href="/docs/reference/services/crossplane" className="reference-link">View CRD →</a>
  <a href="https://github.com/openmcp-project/service-provider-crossplane/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

<div className="reference-card">
  <div className="reference-icon-container reference-icon-container-standard">
    <img src="/docs/img/platform/tower_landscaper.png" alt="Landscaper" className="reference-icon-large" />
  </div>
  <h3>Landscaper</h3>
  <p>Declarative deployment orchestration service using Landscaper.</p>
  <a href="/docs/reference/services/landscaper" className="reference-link">View CRD →</a>
  <a href="https://github.com/openmcp-project/service-provider-landscaper/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

<div className="reference-card">
  <div className="reference-icon-container reference-icon-container-standard">
    <img src="/docs/img/platform/tower_velero.png" alt="Velero" className="reference-icon-large" />
  </div>
  <h3>Velero</h3>
  <p>Backup and disaster recovery service using Velero.</p>
  <a href="/docs/reference/services/velero" className="reference-link">View CRD →</a>
  <a href="https://github.com/openmcp-project/service-provider-velero/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

</div>

## Operator Resources

Resources that platform operators use to configure and manage the platform infrastructure.

### General resources

<div className="reference-grid">

<div className="reference-card">
  <div className="reference-icon-container reference-icon-container-standard">
    <img src="/docs/img/platform/hangar_gardener.png" alt="ClusterProvider" className="reference-icon-large" />
  </div>
  <h3>ClusterProvider</h3>
  <p>Manages Kubernetes clusters and provides access within the ecosystem.</p>
  <a href="/docs/reference/operator/providers/clusterprovider" className="reference-link">View CRD →</a>
  <a href="/docs/users/concepts/cluster-provider" className="reference-link-secondary">Learn Concept</a>
  <a href="https://github.com/openmcp-project/openmcp-operator/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

<div className="reference-card">
  <div className="reference-icon-container reference-icon-container-standard">
    <img src="/docs/img/platform/main.png" alt="PlatformService" className="reference-icon-large" />
  </div>
  <h3>PlatformService</h3>
  <p>Delivers complete platform capabilities and services.</p>
  <a href="/docs/reference/operator/providers/platformservice" className="reference-link">View CRD →</a>
  <a href="/docs/users/concepts/platform-service" className="reference-link-secondary">Learn Concept</a>
  <a href="https://github.com/openmcp-project/openmcp-operator/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

</div>

### Cluster Resources

Resources for managing cluster access and configuration.

<div className="reference-grid">

<div className="reference-card">
  <h3>Cluster</h3>
  <p>Represents a Kubernetes cluster within OpenControlPlane.</p>
  <a href="/docs/reference/operator/clusters/cluster" className="reference-link">View CRD →</a>
  <a href="https://github.com/openmcp-project/openmcp-operator/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

<div className="reference-card">
  <h3>ClusterRequest</h3>
  <p>Request for cluster creation or modification.</p>
  <a href="/docs/reference/operator/clusters/clusterrequest" className="reference-link">View CRD →</a>
  <a href="https://github.com/openmcp-project/openmcp-operator/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

<div className="reference-card">
  <h3>AccessRequest</h3>
  <p>Request access to a cluster or control plane.</p>
  <a href="/docs/reference/operator/clusters/accessrequest" className="reference-link">View CRD →</a>
  <a href="https://github.com/openmcp-project/openmcp-operator/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

<div className="reference-card">
  <h3>ClusterProfile</h3>
  <p>Defines reusable cluster configuration templates.</p>
  <a href="/docs/reference/operator/clusters/clusterprofile" className="reference-link">View CRD →</a>
  <a href="https://github.com/openmcp-project/openmcp-operator/tree/main/api/crds/manifests" className="reference-link-secondary" target="_blank" rel="noopener noreferrer">Source Code</a>
</div>

</div>
