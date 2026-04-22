---
sidebar_position: 3
slug: /users/getting-started/configure
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 3. Configure

This guide shows you how to install managed services in your ControlPlane to extend its functionality.

## Install Managed Services

You can install managed services in your ControlPlane to add capabilities like infrastructure management and workload orchestration.

### Prerequisites

In order to install any of the below offerings, their `ProviderConfig` object must exist in your platform cluster. Each service will have a specific `ProviderConfig` object that you can get from the service provider's repository. Please contact your platform owner to install the necessary configurations and the `ServiceProvider` objects.

:::warning Name Matching
For each of these providers, the `name` of the managed service object **must** match your ControlPlane object's name. This ensures a single ControlPlane cannot have multiple installations of the same provider.
:::

<Tabs>
<TabItem value="crossplane" label="Crossplane" default>

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

</TabItem>
<TabItem value="landscaper" label="Landscaper">

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

</TabItem>
<TabItem value="ocm" label="OCM">

The [Open Component Model (OCM)](https://ocm.software/) toolset helps you deliver and deploy your software securely anywhere, at any scale. It's an open standard that defines deliverables in components that can be further processed, transferred, and verified to any location regardless of the technology of storage.

To install the OCM operator for your ControlPlane, create an `OCM` resource in the same namespace and with the same name as your ControlPlane object:

```yaml
apiVersion: ocm.services.openmcp.cloud/v1alpha1
kind: OCM
metadata:
  name: my-controlplane
  namespace: project-platform-team--ws-dev
spec:
  version: 0.2.0
```

```bash
kubectl apply -f ocm.yaml
```

Once this object reconciles, you can verify the OCM controller is running on the ControlPlane:

```bash
# Make sure you are using the kubeconfig for the ControlPlane
kubectl describe pod -n ocm-k8s-toolkit-system ocm-k8s-toolkit-controller-manager-
```

```
Name:             ocm-k8s-toolkit-controller-manager-68b94b65bc-8ggv8
Namespace:        ocm-k8s-toolkit-system
Priority:         0
Service Account:  ocm-k8s-toolkit-controller-manager
...
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  56s   default-scheduler  Successfully assigned ocm-k8s-toolkit-system/ocm-k8s-toolkit-controller-manager-68b94b65bc-8ggv8 to ***
  Normal  Pulling    56s   kubelet            Pulling image "ghcr.io/open-component-model/kubernetes/controller:0.2.0@sha256:78ffe14..."
  Normal  Pulled     53s   kubelet            Successfully pulled image
  Normal  Created    53s   kubelet            Created container: manager
  Normal  Started    53s   kubelet            Started container manager
```

The base OCM installation comes with a bare minimum set of RBAC settings. To extend this, follow the [custom RBAC for OCM](https://github.com/open-component-model/open-component-model/blob/main/kubernetes/controller/docs/getting-started/custom-rbac.md) guide. Since you are an admin on the ControlPlane, extending the service account's RBAC should work.

</TabItem>
</Tabs>

---

## Next Steps

Congratulations! You have a working ControlPlane with managed services. Here's what you can explore next:

- **[What is a Managed Control Plane?](../concepts/managed-control-plane.md)** — Deeper understanding of ControlPlanes
- **[Service Providers](../concepts/service-provider.md)** — How managed services work
- **[Crossplane Service Provider](https://github.com/openmcp-project/service-provider-crossplane)** — Manage cloud infrastructure
- **[Landscaper Service Provider](https://github.com/openmcp-project/service-provider-landscaper)** — Orchestrate complex workloads
- **[OCM Service Provider](https://github.com/open-component-model/service-provider-ocm)** — Deliver and deploy software with the Open Component Model
