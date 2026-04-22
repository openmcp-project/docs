---
sidebar_position: 2
slug: /reference/operator/providers/clusterprovider
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# ClusterProvider

<div className="crd-header-container">
  <img src="/docs/img/platform/hangar_gardener.png" alt="ClusterProvider" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Manages Kubernetes clusters and provides access within the OpenControlPlane ecosystem. Handles cluster lifecycle operations and access management.</p>
  </div>
</div>

**API Group:** `openmcp.cloud`
**API Version:** `v1alpha1`
**Kind:** `ClusterProvider`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/openmcp-operator/main/api/crds/manifests/openmcp.cloud_clusterproviders.yaml"
  name="ClusterProvider"
  description="Cluster management and lifecycle configuration"
/>

## Related Resources

- [Build a Cluster Provider](/developers/clusterprovider/develop)
- [Cluster Provider Examples](/developers/clusterprovider/examples)
