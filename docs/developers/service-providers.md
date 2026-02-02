# Service Providers

This guide shows you how to create Service Provider for the OpenMCP ecosystem from scratch. Service Providers are the heart of the OpenMCP platform, as they provide the capabilities to offer Infrastructure as Data services to end users.

In this guide, we will walk you through the steps of creating a Service Provider using the [service-provider-template](https://github.com/openmcp-project/service-provider-template), explain the context a service provider operates in, and demonstrate how to run end-to-end tests for it.

By the end of this guide, you should have a solid understanding of how a service works and be ready to build a real world provider such as [service-provider-velero](https://github.com/openmcp-project/service-provider-velero).

Let's get started!

## Overview

A service provider consists of the following two major parts, similar to a regular kubernetes controller:

- **A user-facing ServiceProviderAPI**: This allows end users to request a `DomainService` for a `ManagedControlPlane`, e.g. `FooService` or `Velero`.
- **A controller that reconciles the ServiceProviderAPI**: This controller manages the lifecycle of the provided `DomainService` and its API (such as `Foo` or the CRDs of Velero).

For a visual overview of how these components fit into an openMCP installation, refer to the [service provider deployment model](https://openmcp-project.github.io/docs/about/design/service-provider#deployment-model).

## Prerequisites

Start by creating a new repository for your service provider using the [service-provider-template](https://github.com/openmcp-project/service-provider-template). Click "Use this template" button on the GitHub page and give your new repository a name that reflects the domain service it provides, e.g. `service-provider-velero` for a service provider that deploys Velero.

Clone the newly created repository to your local machine and open it with your favorite IDE.
Finally, ensure that you have Go installed. You can download it from [go.dev](https://go.dev/dl/).

## Service Provider Template Usage

The template allows you to create a service provider without requiring deep knowledge of the underlying OpenMCP platform.

Run the following command to generate a new provider. Replace `velero` with the kind of your service:

```bash
go run ./cmd/template -v -module github.com/openmcp-project/service-provider-velero -kind Velero -group velero
```

The template generates a fully functional service provider that can be executed and deployed on your local machine using [cluster-provider-kind](https://github.com/openmcp-project/cluster-provider-kind) and [openmcp-testing](https://github.com/openmcp-project/openmcp-testing).

To run the the generated end-to-end test using [task](https://taskfile.dev/), execute:

```bash
task test-e2e
```

This test bootstraps a complete local openMCP installation with all required components, including:

- **The platform cluster** where your service provider is managed by the [openmcp-operator](https://github.com/openmcp-project/openmcp-operator)
- **The onboarding cluster** where end users request the domain service you provider offers.
- **A managed control plane cluster (MCP)** where your service provider installs its [DomainServiceAPI](https://openmcp-project.github.io/docs/about/design/service-provider#api) and optionally its workload.
- **An optional workload cluster**, provisioned when using the template fla `-w`. Your service provider then requests a workload cluster from the `openmcp-operator` to deploy its workload outside the MCP. This will result int another kind cluster.

The template generator removes its own code after execution. If you want to revert your changes and start fresh, simply use git and delete any generated untracked files. For this reason, remove template-generation step from the e2e test `.github/workflows/go.yaml` before committing your changes (otherwise your workflow will fail).

```yaml
      - name: Generate template
        run: |
          go run ./cmd/template -v -w
```

## Project Structure

The service provider template is built with [kubebuilder](https://book.kubebuilder.io/introduction), so the project follows the conventions of typical Kubernetes controllers:

- **api/** includes a generated velero and provider config type that you
- **internal/controller/** contains the `Reconciler` where you implement your domain specific reconcile logic.
- **pkg/runtime** contains generic reconcilers that handle openMCP specific logic such as cluster access management and provider config updates. You normally should modify this package. If you encounter any issues, create an issue in the template repository.

If you are new to implementing Kubernetes controllers, consider completing [building a CronJob tutorial](https://book.kubebuilder.io/cronjob-tutorial/cronjob-tutorial.html) before returning to this guide. The rest of this guide highlights the most important steps to create a service provider and the differences compared to a regular Kubernetes controller.

## Create your ServiceProviderAPI

The ServiceProviderAPI type defines the options available to end users when consuming your managed service offering. This API is watched by your `ServiceProviderReconciler`. The template starts with a simple example field:

```go
// FooServiceSpec defines the desired state of FooService
type FooServiceSpec struct {
 // foo is an example field of FooService. Edit fooservice_types.go to remove/update
 // +optional
 Foo *string `json:"foo,omitempty"`
}
```

Modify the spec to expose the configuration your provider supports.

For example, Velero allows the user to choose a version and which plugins to install:

```yaml
apiVersion: velero.services.openmcp.cloud/v1alpha1
kind: Velero
metadata:
  name: test-mcp
spec:
  version: "v1.17.1"
  plugins:
    - name: "aws"
      version: "v1.13.0"
```

Each onboarding API type must include [common status fields](https://openmcp-project.github.io/docs/developers/general/#status-reporting). These are included in the template and you can add additional optional fields.

```go
// FooServiceStatus defines the observed state of FooService.
type FooServiceStatus struct {
 // The status of each condition is one of True, False, or Unknown.
 // +listType=map
 // +listMapKey=type
 // +optional
 Conditions []metav1.Condition `json:"conditions,omitempty"`
 // ObservedGeneration is the generation of this resource that was last reconciled by the controller.
 ObservedGeneration int64 `json:"observedGeneration"`
 // Phase is the current phase of the resource.
 Phase string `json:"phase"`
}
```

For example, Velero includes a list of managed resources.

```go
// Constants representing the phases of a velero instance lifecycle.
const (
 Pending     InstancePhase = "Pending"
 Progressing InstancePhase = "Progressing"
 Ready       InstancePhase = "Ready"
 Failed      InstancePhase = "Failed"
 Terminating InstancePhase = "Terminating"
 Unknown     InstancePhase = "Unknown"
)

type VeleroStatus struct {
 // The status of each condition is one of True, False, or Unknown.
 // +listType=map
 // +listMapKey=type
 // +optional
 Conditions []metav1.Condition `json:"conditions,omitempty"`
 // ObservedGeneration is the generation of this resource that was last reconciled by the controller.
 ObservedGeneration int64 `json:"observedGeneration"`
 // Phase is the current phase of the resource.
 Phase string `json:"phase"`
 // Resources managed by this velero instance
 // +optional
 Resources []ManagedResource `json:"resources,omitempty"`
}

// ManagedResource defines a kubernetes object with its lifecycle phase
type ManagedResource struct {
 corev1.TypedObjectReference `json:",inline"`

 Phase   InstancePhase `json:"phase"`
 Message string        `json:"message,omitempty"`
}
```

## Edit the ProviderConfig API

Service providers must expose a `ProviderConfig` which platform operators use to configure provider behavior. Because [provider deployment](https://openmcp-project.github.io/docs/developers/provider_deployment/) does not support passing arguments to the binary directly, configuration must be expressed via this API.

Typical settings include version constraints, image locations and pull secrets which are especially important to support air-gapped environments.

For example, Velero also implicitly defines the available plugins via the `ProviderConfig`.

```yaml
apiVersion: velero.services.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: default
spec:
  pollInterval: 1m
  availableImages:
    - name: velero
      versions: ["v1.17.1"]
      image: "velero/velero"
    - name: aws
      versions: ["v1.13.0"]
      image: "velero/velero-plugin-for-aws"
  imagePullSecrets:
    - name: privateregcred
```

Note that these image pull secrets reference secrets stored on the platform cluster. It is the responsibility of the service provider to ensure that the referenced secrets are copied to the cluster in which the deployments run.

To synchronize the image pull secrets between the platform cluster and the cluster where your workloads run, you can use the [SecretMutator](https://github.com/openmcp-project/controller-utils/blob/main/pkg/resources/secret.go) from [controller-utils](https://github.com/openmcp-project/controller-utils) inside your [CreateOrUpdate](#createorupdate-operation) logic.

Velero implements this synchronization as follows:

```go
// internal/controller/velero_controller.go
func (r *VeleroReconciler) CreateOrUpdate(ctx context.Context, obj *apiv1alpha1.Velero, pc *apiv1alpha1.ProviderConfig, clusters spruntime.ClusterContext) (ctrl.Result, error) {
 ...
 workloadCluster := resources.NewManagedCluster(clusters.WorkloadCluster.Client(), clusters.WorkloadCluster.RESTConfig(), instance.Namespace(obj), resources.WorkloadCluter)
 secret.Configure(workloadCluster, r.PlatformCluster, pc.Spec.ImagePullSecrets, r.PodNamespace)
 ...
}

// pkg/secret/secret.go
func Configure(cluster resources.ManagedCluster, platformCluster *clusters.Cluster, imagePullSecrets []corev1.LocalObjectReference, sourceNamespace string) {
 for _, pullSecret := range imagePullSecrets {
  secret := resources.NewManagedObject(&corev1.Secret{
   ObjectMeta: metav1.ObjectMeta{
    Name:      pullSecret.Name,
    Namespace: cluster.GetDefaultNamespace(),
   },
  }, resources.ManagedObjectContext{
   ReconcileFunc: func(ctx context.Context, o client.Object) error {
    oSecret := o.(*corev1.Secret)
    sourceSecret := &corev1.Secret{
     ObjectMeta: metav1.ObjectMeta{
      Name:      pullSecret.Name,
      Namespace: sourceNamespace,
     },
    }
    // retrieve source secret from platform cluster
    if err := platformCluster.Client().Get(ctx, client.ObjectKeyFromObject(sourceSecret), sourceSecret); err != nil {
     return err
    }
    mutator := openmcpresources.NewSecretMutator(pullSecret.Name, cluster.GetDefaultNamespace(), sourceSecret.Data, corev1.SecretTypeDockerConfigJson)
    return mutator.Mutate(oSecret)
   },
   StatusFunc: resources.SimpleStatus,
  })
  cluster.AddObject(secret)
 }
}
```

Finally, ensure that the synchronized image pull secrets are [referenced in any workload](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/#create-a-pod-that-uses-your-secret) you reconcile.

## Edit the ServiceProviderReconciler

Your `Reconciler` must implement two functions: `CreateOrUpdate` and `Delete`. The template sets up your reconciler together with the generic reconciler from `pkg/runtime`, which handles openMCP-specifics (cluster access, config updates, etc.).

### CreateOrUpdate Operation

The template example contains a basic implementation that installs a CRD into the tenant MCP.

```go
// CreateOrUpdate is called on every add or update event
func (r *FooServiceReconciler) CreateOrUpdate(ctx context.Context, svcobj *apiv1alpha1.FooService, _ *apiv1alpha1.ProviderConfig, clusters spruntime.ClusterContext) (ctrl.Result, error) {
 spruntime.StatusProgressing(svcobj, "Reconciling", "Reconcile in progress")
 managedObj := &apiextensionsv1.CustomResourceDefinition{
  ObjectMeta: metav1.ObjectMeta{
   Name: "foos.example.domain",
  },
 }
 _, err := ctrl.CreateOrUpdate(ctx, clusters.MCPCluster.Client(), managedObj, func() error {
  managedObj.Spec = fooCRD().Spec
  return nil
 })
 if err == nil {
  spruntime.StatusReady(svcobj)
 }
 return ctrl.Result{}, err
}
```

In a real world example like Velero, this step contains installing and reconciling every required resource, including CRDs, namespace(s), service account(s), deployments(s), etc. into the MCP and workload cluster.

The `ClusterContext` provides access to all request specific clusters. These clusters include the managed control plane and, when requested, the workload cluster associated with the current request. Note that the workload cluster is optional and will not be available for providers that deploy their workload directly to the managed control plane.

```go
type ClusterContext struct {
 MCPCluster *clusters.Cluster
 WorkloadCluster *clusters.Cluster
}
```

In contrast, the platform and onboarding clusters are static clusters that are assigned to the reconciler at initialization.

```go
type FooServiceReconciler struct {
 OnboardingCluster *clusters.Cluster
 PlatformCluster   *clusters.Cluster
}
```

Any update to either the `ServiceProviderAPI` or `ProviderConfig` triggers reconciliation.

### Delete Operation

When a user removes a service, the provider must delete all managed resources.

The basic template example deletes the `Foo` CRD:

```go
func (r *FooServiceReconciler) Delete(ctx context.Context, obj *apiv1alpha1.FooService, _ *apiv1alpha1.ProviderConfig, clusters spruntime.ClusterContext) (ctrl.Result, error) {
 l := logf.FromContext(ctx)
 spruntime.StatusTerminating(obj)
 managedObj := fooCRD()
 if err := clusters.MCPCluster.Client().Delete(ctx, managedObj); client.IgnoreNotFound(err) != nil {
  l.Error(err, "delete object failed")
  return ctrl.Result{}, err
 }
 if err := clusters.MCPCluster.Client().Get(ctx, client.ObjectKeyFromObject(managedObj), managedObj); err != nil {
  return reconcile.Result{}, client.IgnoreNotFound(err)
 }
 // object still exists
 return ctrl.Result{
  RequeueAfter: time.Second * 10,
 }, nil
}
```

## Restrict Cluster Access

The template code runs the provider with full admin permissions. Before releasing you provider, restrict its required permissions with the [ClusterAccessReconciler](https://github.com/openmcp-project/openmcp-operator/blob/main/lib/clusteraccess/clusteraccess.go#L103). There are multiple occurrences in the `main.go` service provider setup.

```go
 spr := spruntime.NewSPReconciler[*fooservicesv1alpha1.FooService, *fooservicesv1alpha1.ProviderConfig](
  func() *fooservicesv1alpha1.FooService { return &fooservicesv1alpha1.FooService{} },
 ).
  WithClusterAccessReconciler(clusteraccess.NewClusterAccessReconciler(platformCluster.Client(), "FooService").
   WithMCPScheme(mcpScheme).
   WithMCPPermissions(adminPermissions).WithMCPRoleRefs([]common.RoleRef{
   {
    Name: "cluster-admin",
    Kind: "ClusterRole",
   }}))
```

## Taskfile Usage

OpenMCP controllers use `task` instead of `make` to generate code, build your controller image, etc. The most important developer commands are:

- **task generate** to regenerate code after API changes
- **task build:img:build-test** to build an image for local testing
- **task test-e2e** for a full pipeline run including code generation, validation and e2e test execution.

Run `task -l` to see all available tasks.

## openmcp-testing

The template includes an e2e test suite built with [kubernetes e2e framework](https://github.com/kubernetes-sigs/e2e-framework) and [openmcp-testing](https://github.com/openmcp-project/openmcp-testing). It provides helper functions such as:

- `ConfigByPrefix` to get a config for `platform`, `mcp`, `onboarding` or `onboarding` clusters.
- `CreateObjectFromDir` to apply manifests to a cluster

Example:

```go
Assess("verify service can be consumed", func(ctx context.Context, t *testing.T, c *envconf.Config) context.Context {
   onboardingConfig, err := clusterutils.ConfigByPrefix("onboarding", "test")
   if err != nil {
    t.Error(err)
    return ctx
   }
   objList, err := resources.CreateObjectsFromDir(ctx, onboardingConfig, "onboarding")
   if err != nil {
    t.Errorf("failed to create onboarding cluster objects: %v", err)
    return ctx
   }
   for _, obj := range objList.Items {
    if err := wait.For(openmcpconditions.Match(&obj, onboardingConfig, "Ready", corev1.ConditionTrue)); err != nil {
     t.Error(err)
    }
   }
   return ctx
})
```
