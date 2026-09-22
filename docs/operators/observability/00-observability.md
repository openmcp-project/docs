---
sidebar_position: 0
id: operator-observability
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Observability

This guide shows you how to monitor the OpenControlPlane platform itself — controller health, API server availability, and fleet-wide resource state across ControlPlanes.

## Prerequisites

- You have operator-level access to the platform cluster.
- You have an OpenTelemetry-compatible backend or a Prometheus-compatible scraper.

## What to monitor as a platform owner

As a platform owner you care about signals that end users can't see — the health of the controllers, operators, and infrastructure that keep ControlPlanes running.

| Signal | Source | Why it matters |
|---|---|---|
| Reconcile error rate | Controller-runtime `/metrics` | Detects controllers that are failing silently |
| Reconcile duration | Controller-runtime `/metrics` | Surfaces slow reconciliation before it cascades |
| Work queue depth | Controller-runtime `/metrics` | Warns about throttling and scaling pressure |
| API server availability | Synthetic probes | Catches connectivity and certificate problems early |
| Resource counts across the fleet | Metrics Operator `FederatedMetric` | Gives fleet-wide inventory for capacity planning |

## Monitor controller health

Every controller built on [controller-runtime](https://github.com/kubernetes-sigs/controller-runtime) exposes a `/metrics` endpoint with reconcile counts, error counts, and durations. This includes Crossplane, Flux, and the Metrics Operator itself.

Scrape these endpoints with a Prometheus-compatible stack or an OpenTelemetry Collector using the `prometheus` receiver.

Key metrics to watch:

| Metric | Type | Signal |
|---|---|---|
| `controller_runtime_reconcile_errors_total` | Counter | Reconcile failures per controller |
| `controller_runtime_reconcile_time_seconds` | Histogram | Reconcile latency |
| `workqueue_depth` | Gauge | Items waiting for reconciliation |
| `workqueue_adds_total` | Counter | Rate of new work items |

### Scrape with ServiceMonitor

If you run the Prometheus Operator, create `ServiceMonitor` resources for each controller:

```yaml title="flux-servicemonitor.yaml"
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: flux-controllers
  namespace: flux-system
spec:
  endpoints:
    - port: http-prom
      path: /metrics
  selector:
    matchLabels:
      app.kubernetes.io/part-of: flux
```

### Scrape with OpenTelemetry Collector

Configure a `prometheus` receiver with Kubernetes service discovery:

```yaml
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: controller-metrics
          scrape_interval: 30s
          kubernetes_sd_configs:
            - role: pod
          relabel_configs:
            - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
              action: keep
              regex: "true"
            - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
              action: replace
              target_label: __address__
              regex: ([^:]+)(?::\d+)?
              replacement: $1:$2
```

## Monitor resources across the fleet

Use `FederatedMetric` and `FederatedManagedMetric` to aggregate signals from multiple ControlPlanes into a single view.

### Federated managed resource health

Track `Ready` and `Synced` conditions across all ControlPlanes:

```yaml title="federated-managed-metric.yaml"
apiVersion: metrics.openmcp.cloud/v1alpha1
kind: FederatedManagedMetric
metadata:
  name: fleet-managed-resources
spec:
  name: "fleet-managed-resources"
  description: "Crossplane managed resource health across all clusters"
  interval: "1m"
  federateClusterAccessRef:
    name: fleet-access
    namespace: default
```

### Federated resource inventory

Count Crossplane providers across clusters:

```yaml title="federated-providers.yaml"
apiVersion: metrics.openmcp.cloud/v1alpha1
kind: FederatedMetric
metadata:
  name: fleet-providers
spec:
  name: "fleet-providers"
  description: "Crossplane providers across clusters"
  target:
    kind: Provider
    group: pkg.crossplane.io
    version: v1
  interval: "1m"
  projections:
    - name: package
      fieldPath: "spec.package"
  federateClusterAccessRef:
    name: fleet-access
    namespace: default
```

See [Remote cluster access](https://github.com/openmcp-project/metrics-operator/blob/main/docs/remote-cluster-access.md) for setting up `FederatedClusterAccess`.

## Deploy an OpenTelemetry Collector for the platform

Deploy a dedicated OpenTelemetry Collector on the platform cluster to aggregate platform-level signals. A minimal pipeline for controller metrics and Kubernetes events:

```yaml title="platform-otel-config.yaml"
receivers:
  prometheus:
    config:
      scrape_configs:
        - job_name: controller-metrics
          scrape_interval: 30s
          kubernetes_sd_configs:
            - role: pod
          relabel_configs:
            - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
              action: keep
              regex: "true"
  k8sobjects:
    objects:
      - group: events.k8s.io
        mode: watch
        name: events
        exclude_watch_type:
          - DELETED

processors:
  memory_limiter:
    check_interval: 5s
    limit_percentage: 80
    spike_limit_percentage: 25
  batch:
    timeout: 5s

exporters:
  otlp:
    endpoint: "https://your-backend:4317"
    tls:
      cert_file: /certs/client.crt
      key_file: /certs/client.key

service:
  pipelines:
    metrics:
      receivers: [prometheus]
      processors: [memory_limiter, batch]
      exporters: [otlp]
    logs:
      receivers: [k8sobjects]
      processors: [memory_limiter, batch]
      exporters: [otlp]
```

See the [OpenTelemetry Collector documentation](https://opentelemetry.io/docs/collector/configuration/) for the full reference.

## Set up platform alerts

Alerts a platform owner should define:

| Alert | Condition | Severity |
|---|---|---|
| Controller reconcile failures | `controller_runtime_reconcile_errors_total` rate > threshold | Critical |
| High work queue depth | `workqueue_depth` > threshold for > 5 min | Warning |
| Slow reconciliation | `controller_runtime_reconcile_time_seconds` p99 > threshold | Warning |
| Fleet-wide managed resource failures | `fleet-managed-resources` with `Ready=False` count > 0 | Critical |
| Backup failures across fleet | Federated backup metric with `phase != Completed` | Critical |

Configure these in your backend's alerting system.

## What's next

- [End-user observability](/users/observability/end-user-observability) — monitoring resources on a ControlPlane
- [Metrics Operator architecture](https://github.com/openmcp-project/metrics-operator/blob/main/docs/architecture.md)
- [FederatedClusterAccess setup](https://github.com/openmcp-project/metrics-operator/blob/main/docs/remote-cluster-access.md)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
