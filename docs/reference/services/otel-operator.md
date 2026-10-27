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
  # opentelemetry-kube-stack chart version — see https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-kube-stack
  version: "0.20.1"
```

The OtelOperator service provider installs the [opentelemetry-kube-stack](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-kube-stack) Helm chart into your ControlPlane. The `spec.version` field selects the chart version; the [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator) version is determined by the chart.
