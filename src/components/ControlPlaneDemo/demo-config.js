export const YAML_TEXT = `apiVersion: core.openmcp.cloud/v1alpha1
kind: ManagedControlPlane
metadata:
  name: my-control-plane
  namespace: my-workspace
spec:
  components:
    crossplane:
      version: 1.17.1`;

export const CP_NAME = 'my-control-plane';
export const WORKSPACE = 'my-workspace';
