---
sidebar_position: 1
id: setup
---

import Tabs from '@theme/Tabs';
import CodeBlock from '@theme/CodeBlock';
import TabItem from '@theme/TabItem';

# Setup

## Prerequisites

* A target Kubernetes cluster that matches the desired cluster provider being used (e.g. `Kind` for local testing, `Gardener` for Gardener Shoots)
* A Git repository that will be used to store the desired state of the openMCP landscape
* An OCI registry that contains the `openMCP Root OCM Component` (e.g. `ghcr.io/openmcp-project`)

:::info
The Git repository used in the following examples must exist before running the `openmcp-bootstrapper` CLI tool. The `openmcp-bootstrapper` is using the default branch (like `main`) as a source to create the desired branch.
The default branch may not be empty, but it should not contain any files or folders that would conflict with the files and folders created by the `openmcp-bootstrapper`. A recommendation is to create an empty repository with a  `README.md` file.
:::

## Download the `openmcp-bootstrapper` CLI tool

The `openmcp-bootstrapper` CLI tool can be downloaded as an OCI image from an OCI registry (e.g. `ghcr.io/openmcp-project`).
In this example docker will be used to run the `openmcp-bootstrapper` CLI tool. If you don't use docker, adjust the command accordingly.

Retrieve the latest version of the `openmcp-bootstrapper`:

```shell
TAG=$(curl -s "https://api.github.com/repos/openmcp-project/bootstrapper/releases/latest" | grep '"tag_name":' | cut -d'"' -f4)
export OPENMCP_BOOTSTRAPPER_VERSION="${TAG}"
```

Pull the latest version of the `openmcp-bootstrapper`:

```shell
docker pull ghcr.io/openmcp-project/images/openmcp-bootstrapper:${OPENMCP_BOOTSTRAPPER_VERSION}
```

## Next Steps

Choose your cluster provider to continue:
- [Kind Provider](./kind-provider) - For local testing and development
- [Gardener Provider](./gardener-provider) - For production Gardener-based landscapes
