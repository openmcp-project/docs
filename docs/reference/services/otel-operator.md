---
sidebar_position: 8
id: otel-operator
---

import CRDViewerCompact from '@site/src/components/CRDViewerCompact';

# OTEL Operator

<div className="crd-header-container">
  <img src="/img/logos/opentelemetry.svg" alt="OTEL Operator" className="crd-header-icon" />
  <div className="crd-header-text">
    <p>Deploys the [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) as a service within `ControlPlanes`, enabling telemetry collection and instrumentation for managed workloads.</p>
  </div>
</div>

**API Group:** `oteloperator.services.openmcp.cloud`
**API Version:** `v1alpha1`
**Kind:** `OtelOperator`

<CRDViewerCompact
  crdUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-otel-operator/main/api/crds/manifests/oteloperator.services.openmcp.cloud_oteloperators.yaml"
  name="OtelOperator"
  description="OtelOperator service provider resource"
  exampleUrl="https://raw.githubusercontent.com/openmcp-project/service-provider-otel-operator/main/test/e2e/onboarding/oteloperator.yaml"
/>

## Usage

Deploy the OpenTelemetry Operator within a control plane:

```yaml
apiVersion: oteloperator.services.openmcp.cloud/v1alpha1
kind: OtelOperator
metadata:
  name: my-controlplane
  namespace: project-platform-team--ws-dev
spec:
  version: "0.20.1"
```

The OtelOperator service provider manages the installation and lifecycle of the [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) within your ControlPlane, enabling OpenTelemetry-based telemetry collection and instrumentation for managed workloads.
