# Provider Deployment

The openMCP architecture knows three different kinds of providers:
- `ClusterProviders` manage kubernetes clusters and access to them
- `PlatformServices` provide landscape-wide service functionalities
- `ServiceProviders` provide the actual services that can be consumed by customers via the ManagedControlPlanes

All providers can automatically be deployed via the corresponding provider resources: `ClusterProvider`, `PlatformService`, and `ServiceProvider`. The [openmcp-operator](https://github.com/openmcp-project/openmcp-operator) is responsible for these resources.

For now, the spec of all three provider kinds looks exactly the same, which is why they are all explained together.
All of them are cluster-scoped resources.
This is a `ClusterProvider` resource as an example:
```yaml
apiVersion: openmcp.cloud/v1alpha1
kind: ClusterProvider
metadata:
  name: gardener
spec:
  image: ghcr.io/openmcp-project/images/cluster-provider-gardener:v0.4.0
  verbosity: INFO
```

## Common Provider Contract

This section explains the contract that provider implementations must follow for the deployment to work.

### Executing the Binary

Further information on how the provider binary is executed can be found below.

#### Image

Each provider implementation must provide a container image with the provider binary set as an entrypoint.

#### Subcommands

The provider binary must take two subcommands:
- `init` initializes the provider. This usually means deploying CRDs for custom resources used by the controller(s).
  - The `init` subcommand is executed as a job once whenever the deployed version of the provider changes.
- `run` runs the actual controller(s) required for the provider.
  - The `run` subcommand is executed in a pod as part of a deployment.
  - The pods with the `run` command are only started after the init job has successfully run through.
  - It may be run multiple times in parallel (high-availability), so the provider implementation should support this, e.g. via leader election.

#### Arguments

Both subcommands take the same arguments, which are explained below. These arguments will always be passed into the provider.
- `--environment` *any lowercase string*
  - The *environment* argument is meant to distinguish between multiple environments (=platform clusters) watching the same onboarding cluster. For example, there could be a public environment and another fenced one - both watch the same resources on the same cluster, but only one of them is meant to react on each resource, depending on its configuration.
  - Most setups will probably use only a single environment.
  - Will likely be set to the landscape name (e.g. `canary`, `live`) most of the time.
- `--provider-name` *any lowercase string*
  - This argument contains the name of the k8s provider resource from which this pod was created.
  - If ever multiple instances of the same provider are deployed in the same landscape, this value can be used to differentiate between them.
- `--verbosity` or `-v` *enum: ERROR, INFO, or DEBUG*
  - This value specifies the desired logging verbosity for the provider.

#### Environment Variables

The following environment variables can be expected to be set:
- `POD_NAME`
  - Name of the pod the provider binary runs in.
- `POD_NAMESPACE`
  - Namespace of the pod the provider binary runs in.
- `POD_IP`
  - IP address of the pod the provider binary runs in.
- `POD_SERVICE_ACCOUNT_NAME`
  - Name of the service account that is used to run the provider.

#### Customizations

While it is possible to customize some aspects of how the provider binary is executed, such as adding additional environment variables, overwriting the subcommands, adding additional arguments, etc., this should only be done in exceptional cases to keep the complexity of setting up an openMCP landscape as low as possible.

### Configuration

Passing configuration into the provider binary via a command-line argument is not desired. If the provider requires configuration of some kind, it is expected to read it from one or more k8s resources, potentially even running a controller to reconcile these resources. The `init` subcommand can be used to register the CRDs for the configuration resources, although this leads to the disadvantage of the configuration resource only been known after the provider has already been started, which can cause problems with gitOps (or similar deployment methods that deploy all resources at the same time).

### Tips and Tricks

#### Getting Access to the Onboarding Cluster

Providers generally live in the platform cluster, so they can simply access it by using the in-cluster configuration. Getting access to the onboarding cluster is a little bit more tricky: First, the `Cluster` resource of the onboarding cluster itself or any `ClusterRequest` pointing to it is required. The provider can simply create its own `ClusterRequest` with purpose `onboarding` - a little trick that is possible due to the shared nature of the onboarding cluster, all requests to it will result in a reference to the same `Cluster`. Then, the provider needs to create an `AccessRequest` with the desired permissions and wait until it is ready. This will result in a secret containing a kubeconfig for the onboarding cluster.

This flow is already implemented in the library function [`CreateAndWaitForCluster](https://github.com/openmcp-project/openmcp-operator/blob/v0.11.2/lib/clusteraccess/clusteraccess.go#L387).

### Examples

Basically, the `ClusterProvider` from the example above will result in the following `Job` and `Deployment` (redacted to the more relevant fields):
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  annotations:
    openmcp.cloud/provider-generation: "8"
    openmcp.cloud/provider-kind: ClusterProvider
    openmcp.cloud/provider-name: gardener
  generation: 1
  labels:
    app.kubernetes.io/component: init-job
    app.kubernetes.io/instance: gardener
    app.kubernetes.io/managed-by: openmcp-operator
    app.kubernetes.io/name: ClusterProvider
  name: gardener-init
  namespace: cp-gardener
  ownerReferences:
  - apiVersion: openmcp.cloud/v1alpha1
    blockOwnerDeletion: true
    controller: true
    kind: ClusterProvider
    name: gardener
    uid: cea97d05-34f3-4d12-865d-79fc6f84ff72
spec:
  backoffLimit: 4
  completionMode: NonIndexed
  completions: 1
  manualSelector: false
  parallelism: 1
  podReplacementPolicy: TerminatingOrFailed
  selector:
    matchLabels:
      batch.kubernetes.io/controller-uid: 90418f79-da36-4787-b339-ff5f3d95417b
  suspend: false
  template:
    metadata:
      labels:
        app.kubernetes.io/component: init-job
        app.kubernetes.io/instance: gardener
        app.kubernetes.io/managed-by: openmcp-operator
        app.kubernetes.io/name: ClusterProvider
        job-name: gardener-init
    spec:
      containers:
      - args:
        - init
        - --environment=default
        - --verbosity=DEBUG
        - --provider-name=gardener
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: metadata.namespace
        - name: POD_IP
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: status.podIP
        - name: POD_SERVICE_ACCOUNT_NAME
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: spec.serviceAccountName
        image: ghcr.io/openmcp-project/images/cluster-provider-gardener:v0.4.0
        name: init
      serviceAccount: gardener-init
      serviceAccountName: gardener-init
```
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gardener
  namespace: cp-gardener
  labels:
    app.kubernetes.io/component: controller
    app.kubernetes.io/instance: gardener
    app.kubernetes.io/managed-by: openmcp-operator
    app.kubernetes.io/name: ClusterProvider
  ownerReferences:
  - apiVersion: openmcp.cloud/v1alpha1
    blockOwnerDeletion: true
    controller: true
    kind: ClusterProvider
    name: gardener
    uid: cea97d05-34f3-4d12-865d-79fc6f84ff72
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/component: controller
      app.kubernetes.io/instance: gardener
      app.kubernetes.io/managed-by: openmcp-operator
      app.kubernetes.io/name: ClusterProvider
  template:
    metadata:
      labels:
        app.kubernetes.io/component: controller
        app.kubernetes.io/instance: gardener
        app.kubernetes.io/managed-by: openmcp-operator
        app.kubernetes.io/name: ClusterProvider
    spec:
      containers:
      - args:
        - run
        - --environment=default
        - --verbosity=DEBUG
        - --provider-name=gardener
        env:
        - name: POD_NAME
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: metadata.namespace
        - name: POD_IP
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: status.podIP
        - name: POD_SERVICE_ACCOUNT_NAME
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: spec.serviceAccountName
        image: ghcr.io/openmcp-project/images/cluster-provider-gardener:v0.4.0
        name: gardener
      serviceAccount: gardener
      serviceAccountName: gardener
```
