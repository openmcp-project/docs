---
authors:
  - MoritzMarby
---

# kcp-aware Service Provider Runtime

## Context and Problem Statement

The OpenControlPlane platform currently supports one way for a service provider to onboard tenants:
a tenant creates a Service API object on the onboarding cluster, the service provider reconciler
picks it up, orders cluster access (MCP + optional workload cluster), and installs the service.

There is no defined way for a service provider to expose its service into a kcp workspace. kcp
(Kubernetes Control Plane) lets tenants work in isolated logical workspaces rather than on a shared
cluster. A tenant in a kcp workspace should be able to request a service the same way a tenant on
the onboarding cluster does - by creating a Service API object - and receive the same result.

At the same time, every service provider today duplicates the same generic reconcile plumbing:
finalizer handling, ProviderConfig loading, cluster-access ordering, kubeconfig delivery, status
management, and deletion sequencing. This duplication makes providers hard to maintain and makes
adding kcp support per-provider prohibitively expensive.

This ADR proposes:

1. A design for how service providers expose their service into kcp workspaces.
2. A unified runtime abstraction that handles both the existing onboarding flow and the new kcp
   flow, so service providers only write install/delete logic.

## Considered Options

* Unified runtime with a single provider seam for both onboarding and kcp modes
* Per-provider kcp implementation (status quo - each provider copies and adapts kcp plumbing)

## Decision Outcome

Chosen option: "Unified runtime with a single provider seam", because it eliminates per-provider
duplication, establishes kcp onboarding as a first-class platform capability, and reduces new
provider development to only service-specific logic.

### Core principle

A service provider implements exactly one interface: install and delete. The runtime owns everything
else - for both the onboarding cluster path and the kcp workspace path. From the provider's
perspective, a service request looks identical regardless of where it came from.

---

## Architecture

### 1. Provider declares what it offers

The service provider defines:

- Its **Service API** type - the CRD a tenant creates to request the service (e.g. `Kro`,
  `Crossplane`). One type is used for both onboarding and kcp modes.
- Its **ProviderConfig** type - platform-operator configuration (available versions, kcp settings,
  workload cluster preferences).
- Its **install/delete logic** - a single `Reconciler` with two methods: `CreateOrUpdate` (install
  or update) and `Delete`.

Everything else is the runtime's responsibility.

### 2. How kcp onboarding works

kcp onboarding is a new capability this ADR introduces. There is no existing implementation to
migrate from. The flow is:

**Provider side (one-time setup):**
1. The provider defines an `APIExport` in its kcp provider workspace, backed by an
   `APIResourceSchema` derived from the same Service API type used on the onboarding cluster.
   One API type, two delivery surfaces.
2. The runtime provisions this `APIExport` at startup from the provider's `ProviderConfig`.

**Tenant side:**
1. A tenant's workspace creates an `APIBinding` to the provider's `APIExport`.
2. The Service API type becomes available in the tenant workspace.
3. The tenant creates a Service API object in their workspace, just as they would on the onboarding
   cluster.

**Runtime reconciliation:**
1. The runtime watches for Service API objects across all bound consumer workspaces via the
   `APIExport` virtual workspace (multicluster-runtime).
2. When a Service API object appears in a workspace, the runtime:
   - Mints a scoped `ServiceAccount` token in the consumer workspace (via TokenRequest API) so the
     workload can reach back at the workspace.
   - Resolves (or orders) a workload cluster if the provider requested one.
   - Calls the provider's `Reconciler.CreateOrUpdate` with all credentials pre-resolved.
3. The provider installs the service exactly as it would in standard mode - it receives a customer
   cluster client and kubeconfig, a workload cluster client and kubeconfig, and a stable tenant
   identity. No kcp-specific code in the provider.

### 3. Unified provider seam

Both discovery paths (onboarding cluster and kcp workspace) funnel into the same two methods:

```
CreateOrUpdate(ctx, serviceAPIObject, providerConfig, clusterContext) -> (result, error)
Delete(ctx, serviceAPIObject, providerConfig, clusterContext) -> (result, error)
```

`ClusterContext` carries pre-resolved credentials:

- `MCPCluster` - ready client for the customer cluster. In standard mode: the MCP control plane.
  In kcp mode: the tenant's kcp workspace. Same field, same type, either mode.
- `MCPKubeconfig` - raw customer kubeconfig. Providers embed this into child resources (e.g. a
  HelmRelease whose worker needs KUBECONFIG pointing at the customer cluster).
- `WorkloadCluster` - ready client for the workload cluster (nil if not requested or not yet
  granted). Workload clusters are shared: the platform may grant access to an existing cluster
  rather than provisioning a new one.
- `WorkloadKubeconfig` - raw workload kubeconfig.
- `Identity` - stable per-tenant identifier (MCP object key in standard mode, kcp logical cluster
  name in kcp mode). Used for deriving stable per-tenant resource names.
- `Mode` - `standard` or `kcp`. Most providers ignore this; it exists for the rare case where
  install logic must genuinely differ.

### 4. ProviderConfig drives mode selection

The `ProviderConfig` CRD is defined by the provider. Adding a `kcp` section activates kcp mode.
No change to `main.go` code is required:

```yaml
spec:
  versions:
    - name: v1.2.3
      chartURL: oci://...
  kcp:
    providerWorkspace: root:my-org:services
    kubeconfigSecret:
      name: kcp-kubeconfig
      namespace: my-provider-ns
```

When `spec.kcp` is absent the provider runs standard mode only. When present, both modes run in the
same process (each with its own manager and leader election ID).

**kcp compatibility depends on how the service deploys its worker.**

There are two deployment patterns:

- **Workerless:** The service worker runs on a separate workload cluster, with its kubeconfig
  pointed at the customer control plane or kcp workspace. The customer cluster is only used as an
  API server - no pods run on it. This pattern is kcp-compatible because kcp workspaces are
  API servers and can serve the service's API surface without running compute.

- **Classic (not kcp-compatible):** The service worker runs directly on the customer control plane,
  on the same cluster the service is operating on. This pattern cannot support kcp because kcp
  workspaces have no compute - pods cannot be scheduled in a kcp workspace.

A provider using the classic pattern must explicitly opt out of kcp:
- Omit the `kcp` field from its `ProviderConfig` CRD schema entirely, so platform operators cannot
  accidentally configure it.
- Not supply a `Provisionable` or kcp wiring in its `main.go`.

The runtime will not start kcp mode unless the provider explicitly wires it up. kcp support is
opt-in, not default.

### 5. Workload cluster ordering

The provider declares at startup whether it needs a workload cluster. This maps directly to the two
deployment patterns described above:

- `WorkloadCluster(true)` (workerless - kcp-compatible): the runtime places a `ClusterRequest` +
  `AccessRequest` and waits until a cluster is granted before calling `CreateOrUpdate`. The service
  worker runs on this separate workload cluster with its kubeconfig pointing at the customer control
  plane or kcp workspace. The granted cluster may be shared with other tenants.
- `WorkloadCluster(false)` (classic - not kcp-compatible): no workload cluster is ordered. The
  service worker runs directly on the customer control plane. This pattern cannot be used with kcp.

In kcp mode the runtime additionally mints a workspace ServiceAccount token so the workload
controller can authenticate back to the customer workspace.

### 6. Provider declares its kcp API surface (kcp mode only)

For kcp mode the provider supplies a `Provisionable` implementation that defines:

- The `APIResourceSchema` (the kcp equivalent of a CRD) for the Service API, derived from the same
  Go type as the onboarding CRD.
- The `APIExport` (name, resource list, permission claims).
- The watched GVK for the multicluster controller.

The runtime calls `Provision` once at startup. After that the provider never touches kcp
infrastructure again - reconciliation is driven by workspace events, resolved by the runtime, and
delivered as a standard `ClusterContext`.

### 7. Deletion

On deletion the runtime:

1. Calls `provider.Delete` with the same resolved `ClusterContext`.
2. Removes the workload cluster access (ClusterRequest + AccessRequest, or kcp workspace SA/RBAC).
3. Removes the customer cluster access (MCP AccessRequest or workspace token cleanup).
4. Removes the finalizer.

The provider is not responsible for any access cleanup.

---

## What the provider does NOT need to write

- Finalizer add/remove logic.
- ProviderConfig loading or watching.
- kcp multicluster manager setup.
- APIExport provisioning lifecycle (schema immutability, upsert).
- Workspace token minting or refresh.
- Workload cluster ordering and wait loop.
- Status patching.
- Mode detection or branching.
- Deletion sequencing (access teardown before finalizer removal).

---

## Non-goals

- The provider's install mechanism (Flux, Helm SDK, raw manifests) is not specified.
- Multi-tenancy isolation guarantees on shared workload clusters.
- Cross-provider APIExport composition.
- The specific fields of any provider's `ProviderConfig`.

---

## Open Questions

1. **CRD install ownership:** Should the runtime own the `init` step (install the Service API CRD
   on the onboarding cluster + register the GVK at the ServiceProvider), or do providers retain a
   thin `init` command for custom pre-flight steps?

2. **APIBinding activation:** Should the runtime watch `APIBinding` objects and trigger a
   reconcile when a workspace binds the APIExport (proactive first-install), or is watching the
   Service API objects across virtual workspaces sufficient (reactive)?

3. **ProviderConfig hot-reload in kcp mode:** When `ProviderConfig` changes (e.g. new chart
   version), should the runtime re-reconcile all active workspaces? Proposal: yes, same fan-out
   behavior as standard mode.

4. **Singleton enforcement:** In kcp mode, the runtime enforces that only one Service API object
   per workspace is active. Default policy: oldest wins - if multiple objects exist, the oldest
   is reconciled and newer ones are rejected with a status message. In standard mode this is not
   needed as the object is named after the corresponding cluster, ensuring uniqueness by convention.

---

### Consequences

* Good, because service provider development is reduced to only service-specific logic.
* Good, because kcp onboarding becomes a first-class platform capability, not a per-provider burden.
* Good, because improvements to cluster-access, token handling, and status management benefit all
  providers immediately.
* Good, because existing providers can migrate incrementally: adopt the unified runtime first
  (standard mode, no behavior change), add kcp support later.
* Bad, because the runtime becomes a more complex shared dependency - changes to the runtime
  interface affect all providers.
