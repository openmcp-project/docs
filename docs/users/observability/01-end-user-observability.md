---
sidebar_position: 1
id: end-user-observability
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# End-user observability

This guide shows you how to monitor the resources you deploy on your ControlPlane — Crossplane managed resources, Deployments, HelmReleases, and other Kubernetes objects.

## Prerequisites

- You have a running ControlPlane.
- You have [installed the Metrics Operator](/users/getting-started/configure) in the ControlPlane.
- You have an OpenTelemetry-compatible backend (any OTLP endpoint) or a Prometheus-compatible scraper.

## Install the Metrics Operator

Request the [Metrics Operator](https://github.com/openmcp-project/metrics-operator) as a managed service on your ControlPlane:

```yaml title="metrics-operator.yaml"
apiVersion: metrics.services.open-control-plane.io/v1alpha1
kind: MetricsOperator
metadata:
  name: my-controlplane
  namespace: project-platform-team--ws-dev
spec:
  version: "v1.1.0"
```

```shell title="Run in terminal"
kubectl apply -f metrics-operator.yaml
```

Choose the latest version from [Metrics Operator releases](https://github.com/openmcp-project/metrics-operator/releases).

You can also install the operator directly via Helm — see the [installation docs](https://github.com/openmcp-project/metrics-operator/blob/main/docs/installation.md).

## Export metrics

The operator supports two export modes: push via OpenTelemetry and pull via Prometheus.

<Tabs defaultValue="push">
  <TabItem value="push" label="OpenTelemetry push">

Create a `DataSink` that points to your OTLP endpoint. Store credentials in a Kubernetes Secret in the same namespace.

```yaml title="datasink.yaml"
apiVersion: metrics.openmcp.cloud/v1alpha1
kind: DataSink
metadata:
  name: default
  namespace: metrics-operator-system
spec:
  connection:
    endpoint: "https://metrics.example.com/v1/metrics"
  authentication:
    apiKey:
      secretKeyRef:
        name: metrics-credentials
        key: api-token
```

Create the Secret and apply:

```shell title="Run in terminal"
kubectl create secret generic metrics-credentials \
  --namespace metrics-operator-system \
  --from-literal=api-token=<api-token>
kubectl apply -f datasink.yaml
```

A metric without `dataSinkRef` uses the `DataSink` named `default`. Set `dataSinkRef.name` to target a different sink.

The `DataSink` also supports mTLS authentication:

```yaml
authentication:
  certificate:
    clientCertSecretKeyRef:
      name: tls-creds
      key: client-cert
    clientKeySecretKeyRef:
      name: tls-creds
      key: client-key
    caCertSecretKeyRef:
      name: tls-creds
      key: ca-cert
```

  </TabItem>
  <TabItem value="pull" label="Prometheus pull">

Install the [Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator), then apply the Metrics Operator `ServiceMonitor`:

```shell title="Run in terminal"
kubectl apply -f https://raw.githubusercontent.com/openmcp-project/metrics-operator/main/config/prometheus/monitor.yaml
```

The `ServiceMonitor` scrapes the operator's HTTPS `/metrics` endpoint. It exposes `metrics_operator_resource_count` alongside standard controller-runtime metrics.

  </TabItem>
</Tabs>

See [Metrics Export](https://github.com/openmcp-project/metrics-operator/blob/main/docs/metrics-export.md) for multiple data sinks, troubleshooting, and migration from legacy configurations.

## Create metrics

The Metrics Operator provides four resource types:

| Kind | What it monitors |
|---|---|
| `Metric` | Kubernetes resources in the local cluster |
| `ManagedMetric` | Crossplane managed resources (categories `crossplane` + `managed`) |
| `FederatedMetric` | Kubernetes resources across multiple clusters |
| `FederatedManagedMetric` | Crossplane managed resources across clusters |

### Monitor managed resource health

This is the most important signal. Crossplane managed resources expose `Ready` and `Synced` conditions — without metrics, failures stay hidden inside cluster objects.

```yaml title="managed-resource-condition.yaml"
apiVersion: metrics.openmcp.cloud/v1alpha1
kind: Metric
metadata:
  name: managed-resource-condition
  namespace: default
spec:
  name: "managed-resource-condition"
  interval: "1m"
  target:
    group: helm.crossplane.io
    version: v1beta1
    kind: Release
  projections:
    - name: ready
      fieldPath: "status.conditions[?(@.type=='Ready')].status"
    - name: synced
      fieldPath: "status.conditions[?(@.type=='Synced')].status"
```

### Monitor HelmRelease status

Track Flux HelmRelease readiness:

```yaml title="helmrelease-status.yaml"
apiVersion: metrics.openmcp.cloud/v1alpha1
kind: Metric
metadata:
  name: helmrelease-status
  namespace: default
spec:
  name: "helmrelease-status"
  target:
    group: helm.toolkit.fluxcd.io
    kind: HelmRelease
    version: v2
  interval: 1m
  projections:
    - name: hr-name
      fieldPath: metadata.name
      type: primitive
    - name: hr-namespace
      fieldPath: metadata.namespace
      type: primitive
    - name: ready-status
      fieldPath: "status.conditions[?(@.type=='Ready')].status"
      type: primitive
```

### Monitor Deployments with labels

Extract custom labels alongside status conditions. This enables alerts like "fire when a critical Deployment becomes unavailable":

```yaml title="deployment-monitor.yaml"
apiVersion: metrics.openmcp.cloud/v1alpha1
kind: Metric
metadata:
  name: deployment-monitor
spec:
  name: "deployment-monitor"
  target:
    kind: Deployment
    group: "apps"
    version: v1
  dataSinkRef:
    name: default
  projections:
    - name: available
      fieldPath: "status.conditions[?(@.type=='Available')].status"
    - name: operations
      fieldPath: "metadata.labels.operations"
```

### Resource inventory

Count resources by kind and version for upgrade planning:

```yaml title="resource-inventory.yaml"
apiVersion: metrics.openmcp.cloud/v1alpha1
kind: Metric
metadata:
  name: resource-inventory
  namespace: default
spec:
  name: "resource-inventory"
  target:
    group: apps
    kind: Deployment
    version: v1
  interval: 1m
  projections:
    - name: count
      fieldPath: "metadata.name"
```

### Backup monitoring

Verify backup completion:

```yaml title="velero-backup-status.yaml"
apiVersion: metrics.openmcp.cloud/v1alpha1
kind: Metric
metadata:
  name: velero-backup-status
  namespace: default
spec:
  name: "velero-backup-status"
  target:
    group: velero.io
    kind: Backup
    version: v1
  interval: 1m
  projections:
    - name: backup-completed
      fieldPath: "status.phase"
```

## Collect logs with OpenTelemetry Collector

The [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) collects logs, metrics, and traces and exports them to any OTLP-compatible backend.

Deploy the collector as a `Deployment` or `DaemonSet` in your ControlPlane. Configure receivers for your signal types:

| Receiver | Signal | Description |
|---|---|---|
| `filelog` | Logs | Reads container log files from `/var/log/pods` |
| `k8sobjects` | Logs | Watches Kubernetes Events |
| `hostmetrics` | Metrics | CPU, memory, disk, network from the node |
| `kubeletstats` | Metrics | Pod and container metrics from kubelet |
| `k8s_cluster` | Metrics | Cluster-level resource metrics |
| `otlp` | All | Receives OTLP from instrumented applications |
| `prometheus` | Metrics | Scrapes Prometheus endpoints |

See the [OpenTelemetry Collector documentation](https://opentelemetry.io/docs/collector/configuration/) for the full configuration reference.

## Set up alerting

With metrics and logs flowing to your backend, configure alerts based on the signals that matter:

- **Managed resource unhealthy:** fire when `Ready=False` or `Synced=False` persists
- **Controller errors:** fire when reconcile error rate exceeds threshold
- **Backup failure:** fire when backup phase is not `Completed`
- **Deployment unavailable:** fire when critical Deployments lose availability

Alert configuration depends on your backend. Consult your backend's documentation for threshold rules, notification channels, and escalation policies.

## What's next

- [Metrics Operator documentation](https://github.com/openmcp-project/metrics-operator/tree/main/docs)
- [Metrics Operator usage examples](https://github.com/openmcp-project/metrics-operator/blob/main/docs/usage.md)
- [Dimensions configuration](https://github.com/openmcp-project/metrics-operator/blob/main/docs/dimensions-configuration.md) — projections, valueFrom, cardinality
- [Remote cluster access](https://github.com/openmcp-project/metrics-operator/blob/main/docs/remote-cluster-access.md) — federated monitoring
- [Platform-owner observability](/operators/observability/operator-observability) — monitoring the platform itself
