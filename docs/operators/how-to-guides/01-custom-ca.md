---
sidebar_position: 1
id: custom-ca
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Configure Custom CAs

Use this guide when your OpenControlPlane platform runs in an environment where services must trust custom Certificate Authorities — for example, an enterprise internal PKI, an air-gapped network, or a private OCI/container registry that presents a certificate issued by a non-public CA.

## Prerequisites

- `kubectl` access to the platform cluster with permissions to create `ConfigMap` resources in the `openmcp-system` namespace
- PEM-encoded certificate files for all custom CAs you want to add

## Step 1 — Create the custom CA bundle

Concatenate all your custom CA certificates into a single PEM file. Each certificate must use the standard PEM format.

```shell
cat /path/to/ca1.crt /path/to/ca2.crt > ca-bundle.crt
```

The resulting file should look like this:

```text title="ca-bundle.crt"
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAMSO...
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJANPQ...
-----END CERTIFICATE-----
```

## Step 2 — Create ConfigMap on the platform cluster

The CA bundles must be available as ConfigMap in the `openmcp-system` namespace on the **platform cluster**.

```shell
kubectl create configmap custom-ca-bundle \
  --from-file=ca-bundle.crt=ca-bundle.crt \
  --namespace=openmcp-system
```

## Step 3 — Reference the bundle in each service provider's ProviderConfig

Each service provider that needs to trust your custom CAs must have a `caBundleRef` added to its `ProviderConfig`. The `caBundleRef` points to the ConfigMap key that contains the appropriate bundle.

The following example uses the Crossplane service provider. Other service providers follow the same pattern but be sure to check their individual documentation for implementation details.

:::apply-to-platform

```yaml title="crossplane-provider-config.yaml"
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: default
  namespace: openmcp-system
spec:
  # ... other fields ...
  caBundleRef:
    name: custom-ca-bundle    # ConfigMap name
    key: ca-bundle.crt        # Key within the ConfigMap
```

:::

Apply the updated ProviderConfig:

```shell
kubectl apply -f crossplane-provider-config.yaml
```

Repeat this step for every service provider installed on your platform.

## Verification

Confirm the ConfigMap is present on the **platform cluster** and contains the expected data:

```shell
kubectl get configmap -n openmcp-system
kubectl describe configmap custom-ca-bundle -n openmcp-system
```

Check that the ProviderConfig of each service provider has been accepted by the operator, e.g. for Crossplane:

```shell
kubectl get providerconfigs.crossplane.services.openmcp.cloud -n openmcp-system
```

Service provider pods that were already running will restart automatically to pick up the new CA configuration. If a pod does not restart, delete it manually to trigger a fresh start.

To verify that the custom CA bundle is valid and trusted, run a temporary pod that mounts the ConfigMap and uses it as the CA store for a `curl` request to an endpoint that is signed by your custom CA. Replace `https://your-internal-service.example.com` with an actual URL in your environment:

```yaml title="ca-test-pod.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: ca-bundle-test
  namespace: openmcp-system
spec:
  restartPolicy: Never
  containers:
    - name: test
      image: ubuntu:24.04
      command:
        - /bin/bash
        - -c
        - |
          apt-get update -qq && apt-get install -y -qq curl
          curl --cacert /ca/ca-bundle.crt https://your-internal-service.example.com
      volumeMounts:
        - name: ca-bundle
          mountPath: /ca
  volumes:
    - name: ca-bundle
      configMap:
        name: custom-ca-bundle
```

```shell
kubectl apply -f ca-test-pod.yaml
kubectl wait --for=condition=Ready pod/ca-bundle-test -n openmcp-system --timeout=60s
kubectl logs -n openmcp-system ca-bundle-test
kubectl delete pod ca-bundle-test -n openmcp-system
```

A successful TLS handshake confirms your custom CA bundle is correct. If `curl` returns a certificate verification error, double-check that the PEM file in the ConfigMap contains the full CA chain up to the root.

:::warning Container runtime
The CA bundle is propagated to service provider components running inside ControlPlanes, but **not** to the container runtime on the cluster nodes. If your private OCI registry uses a custom CA, you must also install the CA certificate directly on the cluster nodes so the kubelet can pull images. Refer to your cluster provider's documentation for node-level CA configuration.
:::
