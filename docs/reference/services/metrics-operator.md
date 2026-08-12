---
sidebar_position: 7
id: metrics-operator
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# Metrics Operator

<div className="crd-header-container">
  <img src="/img/logos/metrics.svg" alt="Metrics Operator" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Delivers the OTel [metrics-operator](https://github.com/openmcp-project/metrics-operator) as a service within `ControlPlanes`, enabling metrics collection and alerting for managed workloads.</p>
  </div>
</div>

**API Group:** `metrics.services.open-control-plane.io`
**API Version:** `v1alpha1`
**Kind:** `MetricsOperator`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-metrics-operator/main/api/crds/manifests/metrics.services.open-control-plane.io_metricsoperators.yaml"
  name="MetricsOperator"
  description="MetricsOperator service provider resource"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-metrics-operator/main/test/e2e/onboarding/metricsoperator.yaml"
/>

## Usage

Deploy the metrics-operator within a control plane:

```yaml
apiVersion: metrics.services.open-control-plane.io/v1alpha1
kind: MetricsOperator
metadata:
  name: my-controlplane
  namespace: project-platform-team--ws-dev
spec:
  version: "v1.0.0"
```

The MetricsOperator service provider manages the installation and lifecycle of [metrics-operator](https://github.com/openmcp-project/metrics-operator) within your ControlPlane, enabling OTel-based metrics collection and alerting for managed workloads.
