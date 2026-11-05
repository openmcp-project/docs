---
sidebar_position: 2
id: personas
slug: /users/concepts/personas
---

# Personas

The table below maps personas to OpenControlPlane concepts. The table can be read as a layered architecture, with the Platform Owner at the foundation:

| Persona | OpenControlPlane Concept | Responsibility |
| :------ | :--------------- | :------------------- |
| Platform Owner | [Platform Service](../../developers/platformservice/design) and [Cluster Provider](../../developers/clusterprovider/design) | Provide platform capabilities consumed by the layers below |
| Service Provider | [Service Providers](../../developers/serviceprovider/design) | Provide managed services consumed by the layer below |
| User | Not an OpenControlPlane concept but a human end user | Generate value from the services provided by Platform Owners and Service Providers |

:::info
For more details on platform personas, see [Why Kubernetes Is Inappropriate for Platforms, and How to Make It Better](https://www.youtube.com/watch?v=7op_r9R0fCo).
:::
