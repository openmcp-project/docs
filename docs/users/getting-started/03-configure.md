---
sidebar_position: 3
---

# 3. Configure

This guide shows you how to install managed services in your ControlPlane to extend its functionality.

## Install Managed Services

You can install managed services in your ControlPlane to add capabilities like infrastructure management and workload orchestration.

### Crossplane

[Crossplane](https://www.crossplane.io/) enables you to manage cloud infrastructure using Kubernetes-style declarative configuration.

To install Crossplane, create a `Crossplane` resource in the same namespace as your ControlPlane:

```yaml
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: Crossplane
metadata:
  name: my-controlplane
  namespace: project-platform-team--ws-dev
spec:
  version: v1.20.0
  providers:
    - name: provider-kubernetes
      version: v0.16.0
```

The `name` must match your ControlPlane name.

```bash
kubectl apply -f crossplane.yaml
```

### Landscaper

[Landscaper](https://github.com/gardener/landscaper) manages the installation, updates, and uninstallation of cloud-native workloads with complex dependency chains.

To install Landscaper, create a `Landscaper` resource:

```yaml
apiVersion: landscaper.services.openmcp.cloud/v1alpha2
kind: Landscaper
metadata:
  name: my-controlplane
  namespace: project-platform-team--ws-dev
spec:
  version: v0.142.0
```

```bash
kubectl apply -f landscaper.yaml
```

---

## Next Steps

Congratulations! You have a working ControlPlane with managed services. Here's what you can explore next:

- **[What is a Managed Control Plane?](../concepts/managed-control-plane.md)** — Deeper understanding of ControlPlanes
- **[Service Providers](../concepts/service-provider.md)** — How managed services work
- **[Crossplane Service Provider](https://github.com/openmcp-project/service-provider-crossplane)** — Manage cloud infrastructure
- **[Landscaper Service Provider](https://github.com/openmcp-project/service-provider-landscaper)** — Orchestrate complex workloads
