---
sidebar_position: 2
id: usage-btp
---

# Deploy to SAP BTP

Your `ControlPlane` can provision and manage **SAP Business Technology Platform (BTP)** resources — service instances, bindings, and subaccounts — using [Crossplane](https://crossplane.io/) with the [SAP BTP provider](https://sap.github.io/crossplane-provider-docs/).

This means BTP resources are managed the same way as any other Kubernetes resource: declaratively, with drift detection and automatic reconciliation.

## Prerequisites

1. **Crossplane** installed on your `ControlPlane` — see [Configure → Crossplane](../getting-started/configure).
2. **SAP BTP Crossplane provider** installed and configured. Ask your platform owner to set up the `ProviderConfig` with the appropriate BTP service account credentials.

Once the provider is running, you can verify it:

```bash
kubectl get providers
# NAME                    INSTALLED   HEALTHY   PACKAGE                                         AGE
# provider-sap-btp        True        True      ghcr.io/sap/crossplane-provider-btp:...        5m
```

---

Now follow the complete guide at [Crossplane BTP provider docs](https://sap.github.io/crossplane-provider-docs/) to provision and manage BTP resources.

---

## Further reading

- [SAP BTP Crossplane provider docs](https://sap.github.io/crossplane-provider-docs/)
- [Crossplane compositions](https://docs.crossplane.io/latest/concepts/compositions/) — alternative to kro for composing BTP resources
- [Configure → Crossplane](../getting-started/configure) — enabling Crossplane on your `ControlPlane`
- [Configure → Kro](../getting-started/configure) — enabling Kro on your `ControlPlane`
