---
sidebar_position: 1
slug: /operators/how-to-guides/custom-ca
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Configure Custom CAs

Use this guide when your OpenControlPlane platform runs in an environment where services must trust custom Certificate Authorities — for example, an enterprise internal PKI, an air-gapped network, or a private OCI/container registry that presents a certificate issued by a non-public CA.

## Prerequisites

- `kubectl` access to the platform cluster with permissions to create `ConfigMap` resources in the `openmcp-system` namespace
- PEM-encoded certificate files for all custom CAs you want to add
- (Optional) cert-manager with [trust-manager](https://cert-manager.io/docs/trust/trust-manager/) installed if you prefer automatic bundle management

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

## Step 2 — Create the full bundle

Service providers that need to connect to both internal and public endpoints require a bundle that includes your custom CAs **and** the well-known public CA certificates. This is called the **full bundle**.

<Tabs>
<TabItem value="manual" label="Manual">

Download a public CA certificate bundle and merge it with your custom bundle:

```shell
curl -fsSL https://curl.se/ca/cacert.pem -o public-cas.crt
cat ca-bundle.crt public-cas.crt > full-bundle.crt
```

:::info Public CA certificate source
The example above uses [curl's CA certificates extracted from Mozilla](https://curl.se/docs/caextract.html). Replace the URL if your organization uses a different source for well-known public CA certificates.
:::

</TabItem>
<TabItem value="trust-manager" label="cert-manager trust-manager">

If [trust-manager](https://cert-manager.io/docs/trust/trust-manager/) is installed, create a `Bundle` resource that merges your custom CAs with the default public CA pool automatically. trust-manager will keep the full bundle up to date as the public CA pool changes.

:::info Assumption
This guide assumes `openmcp-system` is configured as the trust namespace. If that is not the case, add a `namespaceSelector` to the `Bundle` target that matches `openmcp-system`, and create the source ConfigMap in the namespace trust-manager reads from (typically `cert-manager`).
:::

First, create a ConfigMap with your custom CA bundle in the `openmcp-system` namespace:

```shell
kubectl create configmap custom-ca-bundle \
  --from-file=ca-bundle.crt=ca-bundle.crt \
  --namespace=openmcp-system
```

Then create a `Bundle` resource:

```yaml title="full-bundle.yaml"
apiVersion: trust.cert-manager.io/v1alpha1
kind: Bundle
metadata:
  name: full-ca-bundle
spec:
  sources:
    - configMap:
        name: custom-ca-bundle
        key: ca-bundle.crt
    - useDefaultCAs: true
  target:
    configMap:
      key: full-bundle.crt
    namespaceSelector:
      matchLabels:
        kubernetes.io/metadata.name: openmcp-system
```

```shell
kubectl apply -f full-bundle.yaml
```

trust-manager will create and maintain a ConfigMap named `full-ca-bundle` in the `openmcp-system` namespace containing the merged bundle. Skip Step 3 for the full bundle — trust-manager manages it for you.

</TabItem>
</Tabs>

## Step 3 — Create ConfigMap(s) on the platform cluster

The CA bundles must be available as ConfigMaps in the `openmcp-system` namespace on the **platform cluster**.

<Tabs>
<TabItem value="single" label="Single ConfigMap">

Store both bundles in one ConfigMap using two separate keys:

```shell
kubectl create configmap ca-bundles \
  --from-file=ca-bundle.crt=ca-bundle.crt \
  --from-file=full-bundle.crt=full-bundle.crt \
  --namespace=openmcp-system
```

</TabItem>
<TabItem value="separate" label="Two ConfigMaps">

Create one ConfigMap per bundle:

```shell
kubectl create configmap custom-ca-bundle \
  --from-file=ca-bundle.crt=ca-bundle.crt \
  --namespace=openmcp-system

kubectl create configmap full-ca-bundle \
  --from-file=full-bundle.crt=full-bundle.crt \
  --namespace=openmcp-system
```

</TabItem>
</Tabs>

:::info trust-manager users
If you used trust-manager in Step 2, skip this step entirely. Both ConfigMaps are already in place: `custom-ca-bundle` was created as the source for the `Bundle` resource, and trust-manager creates and maintains `full-ca-bundle` automatically.
:::

## Step 4 — Reference the bundle in each service provider's ProviderConfig

Each service provider that needs to trust your custom CAs must have a `caBundleRef` added to its `ProviderConfig`. The `caBundleRef` points to the ConfigMap key that contains the appropriate bundle.

The following example uses the Crossplane service provider. Other service providers follow the same pattern — refer to their individual documentation for details on which bundle to use.

```yaml title="crossplane-provider-config.yaml"
apiVersion: crossplane.services.openmcp.cloud/v1alpha1
kind: ProviderConfig
metadata:
  name: default
  namespace: openmcp-system
spec:
  # ... other fields ...
  caBundleRef:
    name: ca-bundles       # ConfigMap name
    key: full-bundle.crt   # Key within the ConfigMap
```

Apply the updated ProviderConfig:

```shell
kubectl apply -f crossplane-provider-config.yaml
```

Repeat this step for every service provider installed on your platform.

:::info Which bundle to reference
Some service providers should reference the **full bundle** (`full-bundle.crt`) to reach both internal and public endpoints. This is the case when the implementation replaces the default certificate store. Other service provider implementations might append the custom certificates to the existing ones. In this case, the custom-only bundle (`ca-bundle.crt`) should be used. Check each service provider's documentation to confirm.
:::

## Verification

Confirm the ConfigMap(s) are present on the **platform cluster** and contain the expected data:

```shell
kubectl get configmap -n openmcp-system
kubectl describe configmap {ca-bundles,custom-ca-bundle,full-ca-bundle} -n openmcp-system
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
The CA bundle is propagated to service provider components running inside Managed Control Planes, but **not** to the container runtime on the cluster nodes. If your private OCI registry uses a custom CA, you must also install the CA certificate directly on the cluster nodes so the kubelet can pull images. Refer to your cluster provider's documentation for node-level CA configuration.
:::
