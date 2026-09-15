---
sidebar_position: 4
id: metrics
---

import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';

# Metrics

Metrics capture workload measurements at runtime. You can use them to monitor your clusters, create alerts, and investigate changes in resource state.

The [Metrics Operator](https://github.com/openmcp-project/metrics-operator) collects metrics from Kubernetes resources and exports them to an OpenTelemetry-compatible endpoint. It can also expose a Prometheus endpoint for scraping.

## Prerequisites

- You have [a running ControlPlane](/users/getting-started/onboard).
- You have [installed the Metrics Operator](/users/getting-started/configure?service=metrics-operator) in the ControlPlane.
- You have an OpenTelemetry-compatible backend or a Prometheus-compatible scraper.

## Export metrics

The operator supports two export modes.

<Tabs defaultValue="push">
  <TabItem value="push" label="OpenTelemetry push">

Create a `DataSink` that points to your OpenTelemetry endpoint. Store credentials in a Kubernetes Secret in the same namespace as the `DataSink`.

```yaml title="datasink.yaml"
apiVersion: metrics.openmcp.cloud/v1alpha1
kind: DataSink
metadata:
  name: default
  namespace: metrics-operator-system
spec:
  connection:
    endpoint: https://metrics.example.com/v1/metrics
  authentication:
    apiKey:
      secretKeyRef:
        name: metrics-credentials
        key: api-token
```

Create the Secret and apply the manifest:

```shell title="Run in terminal"
kubectl create secret generic metrics-credentials \
  --namespace metrics-operator-system \
  --from-literal=api-token=<api-token>
kubectl apply -f datasink.yaml
```

A metric without `dataSinkRef` uses the `DataSink` named `default`. Set `dataSinkRef.name` when you want to use another sink.

  </TabItem>
  <TabItem value="pull" label="Prometheus pull">

Install the [Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator), then apply the Metrics Operator `ServiceMonitor`:

```shell title="Run in terminal"
kubectl apply -f https://raw.githubusercontent.com/openmcp-project/metrics-operator/main/config/prometheus/monitor.yaml
```

The `ServiceMonitor` scrapes the operator's HTTPS `/metrics` endpoint. It includes controller-runtime metrics and `metrics_operator_resource_count`.

  </TabItem>
</Tabs>

See [Metrics Export](https://github.com/openmcp-project/metrics-operator/blob/main/docs/metrics-export.md) for authentication, multiple data sinks, and troubleshooting.

## Configure metrics

The Metrics Operator provides four resource types:

- `Metric` monitors Kubernetes resources in the local cluster.
- `ManagedMetric` monitors Crossplane managed resources.
- `FederatedMetric` monitors Kubernetes resources across clusters.
- `FederatedManagedMetric` monitors Crossplane managed resources across clusters.

The following `Metric` counts Deployments and adds their namespace and availability state as attributes:

```yaml title="deployment-metric.yaml"
apiVersion: metrics.openmcp.cloud/v1alpha1
kind: Metric
metadata:
  name: deployment-status
spec:
  name: deployment_status
  description: Deployment availability by namespace
  target:
    group: apps
    version: v1
    kind: Deployment
  interval: 1m
  projections:
    - name: namespace
      fieldPath: metadata.namespace
    - name: available
      fieldPath: "status.conditions[?(@.type=='Available')].status"
```

Apply the metric:

```shell title="Run in terminal"
kubectl apply -f deployment-metric.yaml
```

`projections` extract fields from the monitored resource as metric attributes. Use them for labels, annotations, conditions, and other fields that you need to filter or group in your backend.

## What to monitor

Start with signals that show whether your platform is healthy:

- **Managed resource health:** Monitor Crossplane `Ready` and `Synced` conditions.
- **Controller health:** Track reconcile errors, reconcile duration, and work queue depth.
- **Resource inventory:** Count resources by kind, version, and namespace.
- **Backup status:** Monitor backup completion and failures.
- **Workload availability:** Monitor Deployment availability and other workload conditions.

## Learn more

- [Metrics Operator documentation](https://github.com/openmcp-project/metrics-operator/tree/main/docs)
- [Metrics Operator usage examples](https://github.com/openmcp-project/metrics-operator/blob/main/docs/usage.md)
- [OpenTelemetry metrics](https://opentelemetry.io/docs/concepts/signals/metrics/)
- [Prometheus Operator](https://prometheus-operator.dev/)
