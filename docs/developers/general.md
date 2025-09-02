# General Controller Guidelines

This document contains some general guidelines for contributing code to openMCP controllers. The goal is to align the coding and make all controllers look and behave similarly.

## Reconcile Logic

### Operation Annotations

The option to manually trigger or disable reconciliation for specific objects has been shown to be useful in the past. There are two operation annotations which should be supported by each controller:

- `openmcp.cloud/operation: reconcile`
  - This annotation is expected to trigger a reconciliation and then be removed by the reconciling controller.
  - If the reconcile logic contains 'shortcuts' that check if something needs to be done and skip it otherwise, the annotation should cause these checks to always result in the code being executed instead of skipped.
- `openmcp.cloud/operation: ignore`
  - Resources with this annotation should not be reconciled. Simply abort the reconciliation, if this annotation is found.

The following code snippet can be used as a template for the desired behavior:
```go
import (
  apiconst "github.com/openmcp-project/openmcp-operator/api/constants"
  ctrlutils "github.com/openmcp-project/controller-utils/pkg/controller"
)

// within the Reconcile method:
  // handle operation annotation
  hadReconcileAnnotation := false // only required if the information whether the reconciliation was triggered manually is relevant for the reconcile logic
  if obj.GetAnnotations() != nil {
    op, ok := obj.GetAnnotations()[apiconst.OperationAnnotation]
    if ok {
      switch op {
      case apiconst.OperationAnnotationValueIgnore:
        log.Info("Ignoring resource due to ignore operation annotation")
        return reconcile.Result{}, nil
      case apiconst.OperationAnnotationValueReconcile:
        log.Debug("Removing reconcile operation annotation from resource")
        if err := ctrlutils.EnsureAnnotation(ctx, myClient, obj, apiconst.OperationAnnotation, "", true, ctrlutils.DELETE); err != nil {
          return reconcile.Result{}, fmt.Errorf("error removing operation annotation: %w", err)
        }
        hadReconcileAnnotation = true
      }
    }
  }
```

### Status Reporting

Each resource that is reconciled by a controller should include the *common status* in its own status:
```go
import (
	commonapi "github.com/openmcp-project/openmcp-operator/api/common"
)

type MyStatus struct {
	commonapi.Status `json:",inline"`

  // add more status fields if required
}
```

The common status contains the following fields that should be updated during reconciliation:
- `observedGeneration`
  - The value of this field should be set to the value of `metadata.generation` during each reconciliation, independent of whether the reconciliation was successful or resulted in an error.
    - Updating the field can be skipped if the resource has the ignore operation annotation.
- `conditions`
  - This is a list of conditions. It uses the same condition type that k8s also uses for its core resources, e.g. pods.
  - The condition's `type` field works like a key and should be unique among the list.
  - Old conditions should not be deleted when updating the condition list. Each condition has an `observedGeneration` field that maps the condition to the object generation it was created for.
  - The condition's `status` field should be either `True`, `False`, or `Unknown`.
- `phase`
  - The phase aggregates the resource's state into a single string. It is useful for being displayed as an additional printer column for `kubectl get`.
  - Unless there is a good reason for it, it should always contain one of the following values:
    - `Terminating`, if the resource is being deleted (= has a non-zero deletion timestamp)
    - `Ready` if the resource is not being deleted and all of its conditions are `True`
    - `Progressing` otherwise
      - This means that there should be at least one non-`True` condition explaining what is currently happening if the phase is `Progressing`.

> The [controller-utils library](https://github.com/openmcp-project/controller-utils) contains helper functions for updating conditions or even the whole status. See the [documentation](https://github.com/openmcp-project/controller-utils/blob/main/docs/libs/status.md) for further information.

### Event Filtering

Not a hard requirement and also strongly depends on the purpose of the controller, but often it is useful to use the controller-runtime's ability to filter the events which cause a reconciliation. For example, often a resource's status is only modified by the controller reconciling it and a resource is mostly reconciled by only a single controller. In this case, changes to the status do not need to trigger a reconciliation, because they are already a result of one. In many cases, restricting reconciliation triggers to generation changes (which usually correspond to changes to a resource's `spec`) works well. 

The following snippet can be used as a template:
```go
import (
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/predicate"
	ctrlutils "github.com/openmcp-project/controller-utils/pkg/controller"
)

// SetupWithManager sets up the controller with the Manager.
func (r *MyReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&mypackage.MyObjType{}).
		WithEventFilter(predicate.And(
			predicate.Or(
				predicate.GenerationChangedPredicate{},
				ctrlutils.DeletionTimestampChangedPredicate{},
				ctrlutils.GotAnnotationPredicate(openmcpconst.OperationAnnotation, openmcpconst.OperationAnnotationValueReconcile),
				ctrlutils.LostAnnotationPredicate(openmcpconst.OperationAnnotation, openmcpconst.OperationAnnotationValueIgnore),
			),
			predicate.Not(
				ctrlutils.HasAnnotationPredicate(openmcpconst.OperationAnnotation, openmcpconst.OperationAnnotationValueIgnore),
			),
		)).
		Complete(r)
}
```

This example restricts reconciliation triggers to the following events:
- The resource generation changed, indicating a change to the `spec` of the resource.
  - Note that kubernetes seems to increase the generation exactly if some part of a field named `spec` changed. For resources without a `spec` (e.g. secrets), the generation is not increased if the payload changes. If a resource contains additional top-level fields next to `spec`, modifications to them might not cause a generation increase either.
- The resource got a deletion timestamp, meaning its deletion was triggered.
- The resource got the `openmcp.cloud/operation` annotation with value `reconcile` (or it had the annotation before and its value was changed to `reconcile`).

If the resource has the `openmcp.cloud/operation` annotation with value `ignore`, a reconciliation is never triggered, even if the generation was increased or the deletion was triggered.
