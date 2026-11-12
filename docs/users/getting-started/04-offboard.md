---
sidebar_position: 4
id: offboard
---

# 4. Offboard

Don't need the managed services anymore? This section explains how to delete a single managed service or the whole `ControlPlane`.

## Removing a Service

To 'uninstall' a specific service from your `ControlPlane`, you first need to stop any usage of that service. To remove `Flux`, for example, make sure that on your `ControlPlane`, no `HelmRelease`, `Kustomization`, or any other resources managed by `Flux` remain.

:::warning Services in Use
[Service Providers](../concepts/providers) postpone the deletion of service instances as long as that service is still in use. Failing to remove all usage of a service before triggering its deletion is likely to result in the service being stuck in deletion until its usage is removed.
:::

Afterwards, simply delete the corresponding service resource, e.g.
```shell
kubectl delete flux my-controlplane -n project-platform-team--ws-dev
```
to remove a `Flux` service.

## Deleting a ControlPlane

As for a single service, you must end all usage of all services on the `ControlPlane` that should be deleted.

Then, simply delete the `ControlPlane` itself:
```shell
kubectl delete controlplane my-controlplane -n project-platform-team--ws-dev
```

You can delete the service resources (e.g. `Flux`) manually beforehand, but their deletion will also be triggered by deleting the corresponding `ControlPlane`.

:::note Waiting for Deletion
The `ControlPlane` waits for all service resources to be gone before it is removed. If a `ControlPlane` is stuck in deletion, check its status and potential service resources for further information.
:::

### Enforcing ControlPlane Deletion

Sometimes, ending all usage of a service is hard and requires a lot of effort, especially if deleting the service's resources got stuck halfway and the remaining ones are now in an inconsistent state which cannot be cleaned up easily.

In such a situation, the `ControlPlane` can be instructed to delete all service resources **without waiting for them to be deleted properly**:
```shell
kubectl annotate controlplane my-controlplane -n project-platform-team--ws-dev "open-control-plane.io/force-delete=true"
```

:::danger Leaking Resources
Force-deleting a `ControlPlane` should only be done as a last resort and with precise knowledge about how services are used on that `ControlPlane`.

It skips the proper service cleanup and **will** leak any managed resources which are not on the ControlPlane's cluster itself, such as DNS records, S3 buckets, and so on.
:::

#### Timed Force-Deletion

Instead of using `true` as the value for the `open-control-plane.io/force-delete` annotation, it also accepts a [go-parsable duration](https://pkg.go.dev/time#ParseDuration), e.g. `3h`. If configured this way, the force-deletion only kicks in after that amount of time has passed since _the initial deletion of the `ControlPlane`_ (what is displayed under `metadata.deletionTimestamp`).

The time when the force-deletion annotation is added is not relevant here, adding the annotation with a value of `5m` when the `ControlPlane` has been in deletion for one hour already will immediately trigger the force-deletion process.
