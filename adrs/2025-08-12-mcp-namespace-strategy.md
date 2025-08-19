---
authors:
  - MaximilianTechritz
---

# MCP Namespace Strategy for Platform Cluster

## Context and Problem Statement

In the openMCP platform, we need to determine how to organize resources in the Platform Cluster that belong to Managed Control Planes (MCPs). Each MCP represents a separate tenant or customer environment that needs to be isolated and managed independently. The key question is: Should every MCP on the Platform Cluster have its own Namespace to ensure proper isolation, resource management, and security boundaries?

Without proper namespace isolation, MCPs could interfere with each other, leading to security vulnerabilities, resource conflicts, and operational complexity.

## Considered Options

1. **mcp-{hash-mcp-name-and-namespace}** - Create namespaces using a hash of the MCP name and original namespace (hash < 63 chars)
2. **mcp-{uid}** - Create namespaces using the UID of the MCP resource

## Decision Outcome

Option 1: "mcp-{hash-mcp-name-and-namespace}", because it provides unique namespace isolation for each MCP while avoiding conflicts and maintaining deterministic naming that survives backup/restore operations. Option 2 would have been simpler but does not work well with backup/restore scenarios, as the UID changes after a restore operation, breaking the link between the MCP and its namespace.

The hash algorithm we will use with Option 1 is [SHAKE128](https://pkg.go.dev/crypto/sha3#SumSHAKE128). It is an 128-bit algorithm that is FIPS compliant. The 128-bit output allows us to print the hash in the UUID v8 format. So the namespace could look something like `mcp-3f4b2c1d-8e9a-7b6c-5d4e-3f2a1b0c9d8e`.

### Consequences

NONE