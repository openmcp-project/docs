---
authors:
  - ValentinGerlach
  - MoritzMarby
---

# Autonomous Platform Clusters

The goal of this proposal is to streamline and simplify the bootstrapping and lifecycle management of the OpenControlPlane platform for platform operators and contributors.

## Current state

The current setup uses the `openmcp-bootstrapper` CLI to bootstrap a production installation. Before running it, an operator must manually provision a target Kubernetes cluster, set up a non-empty Git repository, and ensure access to the OCI registry. The bootstrapper then pulls component versions and manifest templates from the OCI registry, generates and writes rendered manifests into the Git repository, and deploys FluxCD to the cluster pointing at that repository. From that point on, FluxCD continuously reconciles the cluster state with what is in Git.

This means the Git repository is a required external dependency that must be maintained alongside the cluster. The manifests written into it are generated and templated (similar to Helm output), making them difficult to read, understand, or modify by hand. Any configuration change requires re-running the bootstrapper or editing large generated YAML files directly.

Verifying the setup is also a manual process: an operator must check that FluxCD's `GitRepository` and `Kustomization` resources are in a Ready state, confirm that core components are running in the `openmcp-system` namespace, and create a test `ManagedControlPlaneV2` resource to validate end-to-end functionality.

### Learnings

Operating the platform across multiple landscapes has shown that the Git repository introduces meaningful overhead. Because manifests are generated from a single large configuration file, they are not easy to inspect or adjust by hand, and any change requires going back through the bootstrapper. This adds friction during initial setup, local development, and for smaller teams who want to operate a landscape without the need for complex configurations.

Lifecycle management is currently spread across three layers: the bootstrapper generates and writes manifests before FluxCD takes over, FluxCD manages the base operators and infrastructure, and the OpenMCP operators handle service providers, platform services, and cluster providers. This split has served its purpose but means there is no single place where the full operational state of a platform is described.

A related pattern is that deployment configuration lives separately from the release artifacts themselves. Operators need to follow external guides to understand how to install or upgrade a given version, rather than the components carrying that information with them.

These observations point toward a model where the cluster itself holds and reconciles its own configuration, components ship their own deployment instructions, and the overall setup is simpler to get started with regardless of scale.

## Desired state

The core idea is that a platform cluster should be **autonomous**: configuration and landscape description are stored in-cluster rather than in an external Git repository. This allows the cluster to operate independently, even in air-gapped environments or during network disruptions, and to detect and repair configuration drift on its own.

In-cluster configuration should not depend on a specific delivery mechanism. FluxCD remains a valid option for bringing configuration into the cluster, but it should not be a hard requirement. The platform should be agnostic toward how configuration arrives.

Each component should ship its own deployment configuration as part of its release artifact. This means an operator installing or upgrading a version gets everything they need from the artifact itself, without having to consult a separate guide.

The setup experience should scale in both directions: straightforward enough for a single developer running a local environment, and manageable enough for a team operating multiple landscapes without needing dedicated tooling expertise. Local and production setups should follow the same model.

Finally, the platform should provide clear, machine-readable status reporting - both for the overall platform health and for individual components - so operators have a reliable way to understand what is running and whether it is healthy.

## Terms

### Component

A component in OpenControlPlane is a discrete part of the platform. Examples include the openmcp-operator, platform services, cluster providers, and service providers.

## Solution Proposal

### Distribution Configuration in Releases

Every component in OpenControlPlane ships its own [`ResourceGraphDefinition`](https://kro.run/api/crds/resourcegraphdefinition) as part of its OCM component artifact. Each RGD describes how to install that component into the cluster it is deployed on.

Example for the `openmcp-operator`:

```yaml
apiVersion: kro.run/v1alpha1
kind: ResourceGraphDefinition
metadata:
  name: openmcp-operator
  annotations:
    kro.run/allow-breaking-changes: "true"
spec:
  # kro uses this simple schema to create your CRD schema and apply it
  # The schema defines what users can provide when they instantiate the RGD (create an instance).
  schema:
    apiVersion: v1alpha1
    group: bootstrap.open-control-plane.io
    kind: OpenMCPOperator
    spec:
      ocmRepoName: string
      environment: string | default="main"
      configData: string
    # status:

  # Define the resources this API will manage.
  resources:
    - id: ocmrepo
      externalRef:
        apiVersion: delivery.ocm.software/v1alpha1
        kind: Repository
        metadata:
          name: ${schema.spec.ocmRepoName}

    - id: component
      readyWhen:
        - ${component.status.conditions.exists(c, c.type == 'Ready' && c.status == 'True')}
      template:
        apiVersion: delivery.ocm.software/v1alpha1
        kind: Component
        metadata:
          name: openmcp-operator
        spec:
          repositoryRef:
            name: ${ocmrepo.metadata.name}
          component: github.com/openmcp-project/openmcp-operator
          semver: v0.19.1
          interval: 1m

    - id: resourceImage
      readyWhen:
        - ${resourceImage.status.conditions.exists(c, c.type == 'Ready' && c.status == 'True')}
      template:
        apiVersion: delivery.ocm.software/v1alpha1
        kind: Resource
        metadata:
          name: openmcp-operator-image
        spec:
          componentRef:
            name: ${component.metadata.name}
          resource:
            byReference:
              resource:
                name: openmcp-operator-image
          additionalStatusFields:
            oci: resource.access.toOCI()
    - id: serviceaccount
      template:
        apiVersion: v1
        kind: ServiceAccount
        metadata:
          name: openmcp-operator

    - id: clusterrolebinding
      template:
        apiVersion: rbac.authorization.k8s.io/v1
        kind: ClusterRoleBinding
        metadata:
          name: ${serviceaccount.metadata.namespace}:openmcp-operator
        roleRef:
          apiGroup: rbac.authorization.k8s.io
          kind: ClusterRole
          name: cluster-admin
        subjects:
          - kind: ServiceAccount
            name: ${serviceaccount.metadata.name}
            namespace: ${serviceaccount.metadata.namespace}

    - id: configmap
      template:
        apiVersion: v1
        kind: ConfigMap
        metadata:
          name: openmcp-operator-scheduler-config
        data:
          config: ${schema.spec.configData}

    - id: deployment
      readyWhen:
        - ${deployment.status.readyReplicas == deployment.spec.replicas && deployment.status.availableReplicas == deployment.spec.replicas}
      template:
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          labels:
            app: openmcp-operator
          name: openmcp-operator
        spec:
          replicas: 1
          selector:
            matchLabels:
              app: openmcp-operator
          template:
            metadata:
              labels:
                app: openmcp-operator
              annotations:
                prometheus.io/scrape: "true"
                prometheus.io/port: "8080"
                prometheus.io/path: "/metrics"
            spec:
              serviceAccountName: ${serviceaccount.metadata.name}
              imagePullSecrets: "${resourceImage.status.effectiveOCMConfig.map(s, {'name': s.name})}"
              initContainers:
                - name: openmcp-operator-init
                  image: ${resourceImage.status.resource.access.imageReference}
                  args:
                    - init
                    - --environment=${schema.spec.environment}
                    - --config=/etc/config/openmcp-operator/config
                    - --provider-name=managedcontrolplane
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
                  resources:
                    requests:
                      cpu: 100m
                      memory: 128Mi
                    limits:
                      cpu: 1000m
                      memory: 1024Mi
                  terminationMessagePath: /dev/termination-log
                  terminationMessagePolicy: File
                  volumeMounts:
                    - mountPath: /etc/config/openmcp-operator
                      name: openmcp-operator-scheduler-config
                      readOnly: true
              containers:
                - name: openmcp-operator
                  image: ${resourceImage.status.resource.access.imageReference}
                  args:
                    - run
                    - --environment=${schema.spec.environment}
                    - --config=/etc/config/openmcp-operator/config
                    - --provider-name=managedcontrolplane
                    - --metrics-bind-address=:8080
                    - --metrics-secure=false
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
                  resources:
                    requests:
                      cpu: 100m
                      memory: 128Mi
                    limits:
                      cpu: 1000m
                      memory: 1024Mi
                  terminationMessagePath: /dev/termination-log
                  terminationMessagePolicy: File
                  ports:
                    - name: metrics-http
                      containerPort: 8080
                      protocol: TCP
                  volumeMounts:
                    - mountPath: /etc/config/openmcp-operator
                      name: openmcp-operator-scheduler-config
                      readOnly: true
              volumes:
                - name: openmcp-operator-scheduler-config
                  configMap:
                    name: ${configmap.metadata.name}
```

The RGD can then be installed using the OCM controllers. For the example above, this would look as follows:

```yaml
apiVersion: delivery.ocm.software/v1alpha1
kind: Repository
metadata:
  name: openmcp-repository
spec:
  repositorySpec:
    baseUrl: ghcr.io/openmcp-project/components
    type: OCIRegistry
  interval: 1m
---
apiVersion: delivery.ocm.software/v1alpha1
kind: Component
metadata:
  name: openmcp-operator-rgd
spec:
  repositoryRef:
    name: openmcp-repository
  component: github.com/openmcp-project/openmcp-operator-rgd
  semver: v0.0.2
  interval: 1m
---
apiVersion: delivery.ocm.software/v1alpha1
kind: Resource
metadata:
  name: openmcp-operator-rgd
spec:
  componentRef:
    name: openmcp-operator-rgd
  resource:
    byReference:
      resource:
        name: rgd
---
# Once the RGD is installed in the cluster, create an instance to install the OpenMCP Operator.
apiVersion: delivery.ocm.software/v1alpha1
kind: Deployer
metadata:
  name: openmcp-operator-rgd
spec:
  resourceRef:
    name: openmcp-operator-rgd
```

```yaml
apiVersion: bootstrap.open-control-plane.io/v1alpha1
kind: OpenMCPOperator
metadata:
  name: default
spec:
  ocmRepoName: openmcp-repository
  environment: local
  configData: |
    managedControlPlane:
      mcpClusterPurpose: mcp-worker
      reconcileMCPEveryXDays: 7
    scheduler:
      scope: Cluster
      purposeMappings:
        mcp:
          template:
            spec:
              profile: kind
              tenancy: Exclusive
        mcp-worker:
          template:
            spec:
              profile: kind
              tenancy: Exclusive
        platform:
          template:
            metadata:
              labels:
                clusters.openmcp.cloud/delete-without-requests: "false"
            spec:
              profile: kind
              tenancy: Shared
        onboarding:
          template:
            metadata:
              labels:
                clusters.openmcp.cloud/delete-without-requests: "false"
            spec:
              profile: kind
              tenancy: Shared
        workload:
          tenancyCount: 20
          template:
            spec:
              profile: kind
              tenancy: Shared
```

Once this is applied, the OpenMCP Operator is installed. When the OCM component is upgraded, the operator is automatically updated without any configuration change.

A semver filter can be defined on the OCM component resource to automatically update to new minor versions.

The core principle is that all components ship their deployment configuration alongside their release artifacts using RGDs. This enables loosely coupled deployments and makes it possible to bundle components into distributions (see the next section).

### Distributions

A distribution bundles a set of components into a single top-level RGD, so the whole platform is described as one resource graph and bootstrapped from a handful of Kubernetes resources.

The distribution RGD does not repeat each component's install logic. Instead it instantiates the per-component RGDs (`OpenMCPOperator`, `ClusterProviderKind`, `PlatformService`, ...), passing each the OCM repository to pull from. Each instance triggers its own component's RGD, which handles the actual install as shown in the previous section.

The following example shows a Kind distribution of OpenControlPlane.

```yaml
apiVersion: kro.run/v1alpha1
kind: ResourceGraphDefinition
metadata:
  name: open-control-plane-platform
  annotations:
    kro.run/allow-breaking-changes: "true"
spec:
  # kro uses this simple schema to create your CRD schema and apply it
  # The schema defines what users can provide when they instantiate the RGD (create an instance).
  schema:
    apiVersion: v1alpha1
    group: bootstrap.open-control-plane.io
    kind: OpenControlPlanePlatform
    spec:
      ocmRepoName: string
    # status:

  # Define the resources this API will manage.
  resources:
    - id: ocmrepo
      externalRef:
        apiVersion: delivery.ocm.software/v1alpha1
        kind: Repository
        metadata:
          name: ${schema.spec.ocmRepoName}

    - id: openmcpoperator
      template:
        apiVersion: bootstrap.open-control-plane.io/v1alpha1
        kind: OpenMCPOperator
        metadata:
          name: default
        spec:
          ocmRepoName: ${ocmrepo.metadata.name}
          environment: local
          configData: |
            managedControlPlane:
              mcpClusterPurpose: mcp-worker
              reconcileMCPEveryXDays: 7
            scheduler:
              scope: Cluster
              purposeMappings:
                mcp:
                  template:
                    spec:
                      profile: kind
                      tenancy: Exclusive
                mcp-worker:
                  template:
                    spec:
                      profile: kind
                      tenancy: Exclusive
                platform:
                  template:
                    metadata:
                      labels:
                        clusters.openmcp.cloud/delete-without-requests: "false"
                    spec:
                      profile: kind
                      tenancy: Shared
                onboarding:
                  template:
                    metadata:
                      labels:
                        clusters.openmcp.cloud/delete-without-requests: "false"
                    spec:
                      profile: kind
                      tenancy: Shared
                workload:
                  tenancyCount: 20
                  template:
                    spec:
                      profile: kind
                      tenancy: Shared

    - id: clusterprovider
      template:
        apiVersion: bootstrap.open-control-plane.io/v1alpha1
        kind: ClusterProviderKind
        metadata:
          name: default
        spec:
          ocmRepoName: ${schema.spec.ocmRepoName}

    - id: platformservicegateway
      template:
        apiVersion: bootstrap.open-control-plane.io/v1alpha1
        kind: PlatformService
        metadata:
          name: platform-service-gateway
        spec:
          ocmRepoName: ${schema.spec.ocmRepoName}
          ocmComponent:
            name: github.com/openmcp-project/platform-service-gateway
            semver: v0.0.10

    - id: platformservicedns
      template:
        apiVersion: bootstrap.open-control-plane.io/v1alpha1
        kind: PlatformService
        metadata:
          name: platform-service-dns
        spec:
          ocmRepoName: ${schema.spec.ocmRepoName}
          ocmComponent:
            name: github.com/openmcp-project/platform-service-dns
            semver: v0.0.5
```

The distribution RGD is itself shipped as an OCM component (`open-control-plane-platform`) whose component references pull in the per-component RGD components transitively. Bootstrapping the platform then reduces to: register the OCM `Repository`, pull the distribution component, deploy its RGD, and instantiate `OpenControlPlanePlatform`. From that point on the whole graph is upgradeable through OCM.

```yaml
apiVersion: delivery.ocm.software/v1alpha1
kind: Repository
metadata:
  name: openmcp-repository
spec:
  repositorySpec:
    baseUrl: ghcr.io/openmcp-project/components
    type: OCIRegistry
  interval: 1m
---
# Pull the distribution component which carries the OpenControlPlanePlatform RGD.
apiVersion: delivery.ocm.software/v1alpha1
kind: Component
metadata:
  name: open-control-plane-platform
spec:
  repositoryRef:
    name: openmcp-repository
  component: github.com/openmcp-project/open-control-plane-platform
  semver: v0.0.4
  interval: 1m
---
apiVersion: delivery.ocm.software/v1alpha1
kind: Resource
metadata:
  name: open-control-plane-platform-rgd
spec:
  componentRef:
    name: open-control-plane-platform
  resource:
    byReference:
      resource:
        name: rgd
---
# Installs the RGD shown above into the cluster.
apiVersion: delivery.ocm.software/v1alpha1
kind: Deployer
metadata:
  name: open-control-plane-platform-rgd
spec:
  resourceRef:
    name: open-control-plane-platform-rgd
---
# Once the RGD is registered, instantiating it bootstraps the whole platform.
apiVersion: bootstrap.open-control-plane.io/v1alpha1
kind: OpenControlPlanePlatform
metadata:
  name: default
spec:
  ocmRepoName: openmcp-repository
```

#### Current limitation: staged bootstrap

The single-apply flow above is the target shape, but it is not yet achievable with kro. kro resolves the schema of **all** resources in an RGD up front. The `ClusterProviderKind` and `PlatformService` instances expand to RGDs that reference `openmcp.cloud/*` CRDs, and those CRDs only exist after the `OpenMCPOperator` has booted and registered them. kro therefore hard-fails the distribution RGD before its own CRD is ever created, so no instance can be applied.

This is tracked upstream in [kro#1293](https://github.com/kubernetes-sigs/kro/issues/1293) (deferred schema resolution). Until it lands, the platform is bootstrapped in stages, ordering the applies by dependency and waiting between them:

1. Register the OCM `Repository`, the RBAC binding for the OCM controller, and the distribution `Component`.
2. Deploy the per-component RGDs (`OpenMCPOperator`, `ClusterProviderKind`, `PlatformService`). Their kro CRDs become Established; the `ClusterProviderKind` and `PlatformService` RGDs stay inactive because the `openmcp.cloud/*` CRDs they reference do not exist yet.
3. Apply the `OpenMCPOperator` instance on its own. Once it is Ready the operator registers the `openmcp.cloud/*` CRDs, kro re-resolves the pending schemas, and the two stuck RGDs flip to active.
4. Apply the `ClusterProviderKind` and `PlatformService` instances.

Steps 3 and 4 are separate because the OCM `Deployer` applies its manifest atomically: bundling the operator instance together with the platform instances fails on the first apply, since the platform kinds are still unknown at that point.

Once kro#1293 is resolved, this collapses back into the single-apply flow above: one `Deployer` for the distribution RGD plus one `OpenControlPlanePlatform` instance, with the ordering handled inside kro.

An additional caveat is RBAC: the OCM controller applies the RGDs, kro instances, and downstream `openmcp.cloud/*` resources, so it needs broad permissions on the platform cluster. The reference implementation grants it `cluster-admin` via a `ClusterRoleBinding`, which is acceptable for a demo but should be scoped down for production.
