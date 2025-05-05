
status: {draft | **proposed** | rejected | accepted | deprecated}<br>
date: 2025-04-24<br>
deciders: Johannes Aubart, Robert Graeff, Ingo Kober<br>

# Landscaper Testability

## Context and Problem Statement

For users of the Landscaper, the development of Installations and Blueprints involves several templates. Since the development of these templates can be error-prone, it is important to have a way to test them. This would simplify the development process and help to ensure quality. Below we propose a solution to enable testing of Installations and their Blueprints.

Related issue:
- [User Story: Testability for Landscaper Resources](https://github.com/openmcp-project/backlog/issues/84)

## Proposed Solution

Our proposal is to introduce a "dry-run" mode for the processing of Installations by the Landscaper.

### Enabling Dry-Run Mode

The dry-run mode can be enabled for an Installation by annotating it with `landscaper.gardener.cloud/dry-run: "true"`.

It suffices to annotate a root Installation. The Landscaper will propagate the annotation to all sub-objects (sub-installations, executions, and deploy items), so that all of them will be processed in dry-run mode.

### Processing Installations and Executions in Dry-Run Mode

In dry-run mode, Installations and Executions are processed as normal. In these steps, templating is done for
- `importDataMappings` defined in the Installation,
- `exportDataMappings` defined in the Installation,
- `deployExecutions` defined in the Blueprint,
- `subinstallationExecutions` defined in the Blueprint.
- `exportExecutions` defined in the Blueprint.

In case of an error during the templating, the Installation will fail. Otherwise, the sub-Installations, Executions, and DeployItems are created as usual and can be inspected on the cluster.

### Processing DeployItems in Dry-Run Mode

In dry-run mode, the Helm and Manifest deployer process DeployItems differently than in normal mode:
- The deployers do not change the state on target clusters: no resources are created, updated, or deleted.
- Readiness checks are skipped.
- Export values are not collected from target clusters. Instead, the user can provide a custom resource from which the export values are read, see [Export Values](#export-values)

### Export Values

Suppose a DeployItem has an export defined, for example:

```yaml
  exports:
    exports:
      - key: test-token
        fromResource:
          apiVersion: v1
          kind: Secret
          name: test-secret
          namespace: example
        jsonPath: .data.token
```

Normally, the export value would be taken from an object on the target cluster. In dry-run mode, the user can create a `DryRunConfiguration` custom resource. It contains a list of objects (field `spec.exports`) which serve as replacements for the objects on the target cluster.

```yaml
apiVersion: landscaper.gardener.cloud/v1alpha1
kind: DryRunConfiguration
metadata:
  name: test-dry-run
  namespace: cu-example
spec:
  exports:
    - apiVersion: v1
      kind: Secret
      metadata:
        name: test-secret
        namespace: example
      data:
        token: ...
```

The objects in the DryRunConfiguration need not be the complete. A fragment of each object is sufficient. It must contain:
- the key fields to identify the object (apiVersion, kind, name, namespace),
- the field to evaluate the jsonPath of the export.

The DryRunConfiguration resource must be created on the MCP cluster (= resource cluster) in the same namespace as the Installation. Its name can be provided via an annotation `landscaper.gardener.cloud/dry-run-configuration` at the root installation:

```yaml
apiVersion: landscaper.gardener.cloud/v1alpha1
kind: Installation
metadata:
  name: test-installation
  namespace: cu-example
  annotations:
    landscaper.gardener.cloud/dry-run: "true"
    landscaper.gardener.cloud/dry-run-configuration: test-dry-run
```

The annotation `landscaper.gardener.cloud/dry-run-configuration` can be omitted if there are no DeployItems with exports.

#### Limitation

Exports can come from different target clusters. To simplify the setup the objects in the DryRunConfiguration are not grouped by targets. (Theoretically, there could be an export from object X on cluster 1 and another export from an object with the same key X on a different cluster 2.)