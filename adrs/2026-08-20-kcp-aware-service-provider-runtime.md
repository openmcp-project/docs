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
(Kubernetes-like Control Plane) lets tenants work in isolated logical workspaces rather than on a shared
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
- Its **ProviderConfig** type - service configuration such as available versions and workload
  cluster preferences. It does not select the runtime mode.
- Its **install/delete logic** - a single `Reconciler` with two methods: `CreateOrUpdate` (install
  or update) and `Delete`.

Everything else is the runtime's responsibility.

### 2. How kcp onboarding works

kcp onboarding is a new capability this ADR introduces. There is no existing implementation to
migrate from. The flow is:

**Provider side (one-time setup):**
1. The provider defines an `APIResourceSchema` from the same Service API type used on the
   onboarding cluster. One API type has two delivery surfaces.
2. The platform deployment applies the schema and `APIExport` in the kcp provider workspace.
   It supplies workspace credentials to the provider process. The runtime does not provision
   the export from `ProviderConfig`.

**Tenant side:**
1. A tenant's workspace creates an `APIBinding` to the provider's `APIExport`.
2. The Service API type becomes available in the tenant workspace.
3. The tenant creates a Service API object in their workspace, just as they would on the onboarding
   cluster.

**Runtime reconciliation:**
1. The runtime watches for Service API objects across all bound consumer workspaces via the
   `APIExport` virtual workspace (multicluster-runtime).
2. When a Service API object appears in a workspace, the runtime:
   - Uses the workspace credential provided by the deployment and obtains request-scoped
     access through the common cluster-access reconciler.
   - Resolves (or orders) a workload cluster if the provider requested one.
   - Calls the provider's `Reconciler.CreateOrUpdate` with the resolved cluster clients and
     keys for their kubeconfig Secrets.
3. The provider installs the service with the same reconcile method as in standard mode.
   The multicluster request carries the workspace identity when names must be unique across tenants.

### 3. Unified provider seam

Both discovery paths (onboarding cluster and kcp workspace) funnel into the same two methods:

```
CreateOrUpdate(ctx, serviceAPIObject, providerConfig, clusterContext) -> (result, error)
Delete(ctx, serviceAPIObject, providerConfig, clusterContext) -> (result, error)
```

The runtime supplies the same `clusteraccess.ClusterContext` in both modes. It contains the
MCP cluster client, the key for its kubeconfig Secret, and the equivalent workload cluster
fields when a workload cluster is present. In kcp mode, the MCP cluster is the tenant's
workspace. The multicluster request includes the logical workspace identity so access
objects from different workspaces cannot collide.

### 4. Deployment selects the runtime mode

The service provider deployment selects one mode when the process starts. A standard deployment
uses the onboarding cluster and `MustBuild`. A kcp deployment receives registered workspace
credentials, creates a multicluster manager, and uses `MustBuildMulticluster`. The same binary
can support both paths, but a `ProviderConfig` change does not switch a running process between
them. A platform can run separate deployments when it needs both modes.

The initial Flux and External Secrets integrations select the kcp path with the
`--onboarding-kubeconfig-label` startup flag. The operator registers labeled credentials in
the provider namespace. Without that flag, each provider uses the standard onboarding path.

**kcp compatibility depends on how the service deploys its worker.**

There are two deployment patterns:

- **Separate worker:** The service worker runs on the platform cluster or a workload cluster.
  Its kubeconfig points at the end user control plane or kcp workspace. No pods run in the
  kcp workspace, so this pattern supports kcp.

- **Classic (not kcp-compatible):** The service worker runs directly on the end user control plane,
  on the same cluster the service is operating on. This pattern cannot support kcp because kcp
  workspaces have no compute - pods cannot be scheduled in a kcp workspace.

A provider using the classic pattern must explicitly opt out of kcp:
- Do not enable the kcp deployment path.
- Keep its binary on the standard manager until it can run its worker on a separate cluster.

The runtime will not start kcp mode unless the provider explicitly wires it up. kcp support is
opt-in, not default.

### 5. Workload cluster access

The provider registers the cluster access it needs when it starts. The common access reconciler
obtains MCP access and, when configured, workload cluster access before it calls
`CreateOrUpdate`. The workload cluster may be shared with other tenants. A provider can also
run its worker on the platform cluster without ordering a separate workload cluster.

In kcp mode, the worker must not run inside the tenant workspace. A workspace is an API server,
not a compute cluster.

In kcp mode, the platform operator supplies workspace credentials. The runtime's cluster-access
reconciler gives the service provider request-scoped access to that workspace.

### 6. Provider declares its kcp API surface (kcp mode only)

The provider supplies the Service API schema and watched GVK. The platform deployment applies
the `APIResourceSchema` and `APIExport` in the provider workspace. It owns the export's labels
and annotations in the same declarative source. For example, Platform Mesh can set
`ui.platform-mesh.io/content-for` on the `APIExport` there. The runtime consumes the export
through the multicluster manager; it does not create or update the export at startup.

This keeps export ownership with the deployment that chooses kcp mode. A `ProviderConfig` holds
service settings, not infrastructure metadata or deployment mode.

### 7. Deletion

On deletion the runtime:

1. Calls the provider's `Reconciler.Delete` with the resolved `ClusterContext`.
2. Calls the common cluster-access `ReconcileDelete` with the same request identity and
   additional data used for creation. It waits for the access requests to finish deletion.
3. Leaves workspace token and RBAC cleanup to the operator that owns the workspace runtime.
4. Removes the finalizer.

The provider is not responsible for any access cleanup.

---

## What provider install and delete logic does not need to write

- Finalizer add/remove logic.
- ProviderConfig loading or watching.
- APIExport provisioning or workspace token management. These belong to the platform deployment
  and operator, not to the service's install and delete logic.
- Workload cluster ordering and wait loop.
- Kubernetes status patching. The provider reports status content; the runtime writes it to the
  object.
- Mode selection. The provider process selects its manager during startup.
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

   Proposed resolution: keep the standard-mode name convention as the rule instead of
   limiting cardinality. A service object is bound to the ControlPlane of the same name;
   uniqueness per target then comes for free from Kubernetes name uniqueness, with no
   enforcement code and no API change, and the identity derivation used for cluster access
   stays untouched. Workspaces with several ControlPlanes keep working (Flux `prod` and
   Flux `dev` serve ControlPlanes `prod` and `dev`). The one hard requirement: an object
   without a matching ControlPlane must not be ignored silently - it stays `Progressing`
   with a visible condition (e.g. `NoMatchingControlPlane`), and reconciles once the
   ControlPlane appears. An explicit `targetRef` field (defaulting to `metadata.name`)
   remains a compatible later extension if free naming is ever wanted.

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
