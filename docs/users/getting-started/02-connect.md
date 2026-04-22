---
sidebar_position: 2
slug: /users/getting-started/connect
---

# 2. Connect

This guide shows you how to retrieve credentials and connect to your ControlPlane using kubectl.

## Check ControlPlane Status

First, verify your ControlPlane is ready:

```bash
kubectl get managedcontrolplanev2 my-controlplane -n project-platform-team--ws-dev
```

Wait until the ControlPlane shows a ready status. The `status.access` field contains references to your credentials.

## Retrieve Your Kubeconfig

The ControlPlane creates secrets containing kubeconfig files for each authentication method you configured.

### For OIDC Authentication (Human Users)

```bash
# Get the secret name from status
SECRET_NAME=$(kubectl get managedcontrolplanev2 my-controlplane \
  -n project-platform-team--ws-dev \
  -o jsonpath='{.status.access.oidc.secretRef.name}')

# Retrieve and decode the kubeconfig
kubectl get secret $SECRET_NAME -n project-platform-team--ws-dev \
  -o jsonpath='{.data.kubeconfig}' | base64 -d > my-controlplane-oidc.kubeconfig
```

### For Token Authentication (Machine Users)

```bash
# Get the secret name from status
SECRET_NAME=$(kubectl get managedcontrolplanev2 my-controlplane \
  -n project-platform-team--ws-dev \
  -o jsonpath='{.status.access.tokens[0].secretRef.name}')

# Retrieve and decode the kubeconfig
kubectl get secret $SECRET_NAME -n project-platform-team--ws-dev \
  -o jsonpath='{.data.kubeconfig}' | base64 -d > my-controlplane-token.kubeconfig
```

## Verify Access

Test your connection to the ControlPlane:

```bash
# Using the retrieved kubeconfig
kubectl --kubeconfig=my-controlplane-oidc.kubeconfig get namespaces
```

You should see the default Kubernetes namespaces, confirming your ControlPlane is accessible.

:::tip Set as Default Context
To use your ControlPlane as the default context:
```bash
export KUBECONFIG=my-controlplane-oidc.kubeconfig
kubectl get namespaces
```
:::

---

## Next Steps

Continue to [3. Configure](./03-configure.md) to install managed services and extend your ControlPlane functionality.
