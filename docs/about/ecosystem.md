---
sidebar_position: 2
---

# Ecosystem

openMCP is a platform built on top of amazing open-source projects. The major ones are listed below.

## Kubernetes

"[Kubernetes](https://kubernetes.io/), also known as K8s, is an open source system for automating deployment, scaling, and management of containerized applications."[^kubernetes] openMCP not only runs on Kubernetes but also uses the Kubernetes API as the central interface for all human users as well as integrations and automations. The components of openMCP extend the Kubernetes API through [Custom Resource Definitions (CRDs)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/), enabling the use of Kubernetes for configuring more than just compute, storage, and networking resources.

## Gardener

[Gardener](https://gardener.cloud/) delivers "fully-managed clusters at scale everywhere with your own Gardener installation".[^gardener] Supported infrastructure includes AWS, Azure, and GCP but also OpenStack, [IronCore](https://github.com/ironcore-dev/gardener-extension-provider-ironcore), [Hetzner Cloud](https://github.com/23technologies/gardener-extension-provider-hcloud), and others. Like openMCP, Gardener is a Kubernetes extension and "adheres to the same principles for resiliency, manageability, observability and high automation by design".[^gardener] openMCP can use Gardener as a [cluster provider](concepts/cluster-provider.md).

## Open Component Model

"The [Open Component Model (OCM)](https://ocm.software/) is an open standard that enables teams to describe software artifacts and their lifecycle metadata in a consistent, technology-agnostic way."[^ocm] openMCP uses the OCM to package components and their dependencies, ensuring a reliable delivery to any (even air-gapped) environment.

## Crossplane

"[Crossplane](https://www.crossplane.io/) is an open source, CNCF project built on the foundation of Kubernetes to orchestrate anything."[^crossplane] It makes use of providers to connect to various cloud APIs – a concept that is known from Terraform/OpenTofu. Enabling Crossplane as a [service provider](concepts/service-provider.md) in openMCP allows end-users to make use of the rich ecosystem of Crossplane providers.

## Flux

"[Flux](https://fluxcd.io/) is a set of continuous and progressive delivery solutions for Kubernetes that are open and extensible."[^fluxcd] When enabled in an openMCP environment, users can benefit from [GitOps](https://www.cncf.io/blog/2025/06/09/gitops-in-2025-from-old-school-updates-to-the-modern-way/) features as part of their [MCPs](concepts/managed-control-plane.md).

## Kyverno

"The [Kyverno](https://kyverno.io/) project provides a comprehensive set of tools to manage the complete Policy-as-Code (PaC) lifecycle for Kubernetes and other cloud native environments."[^kyverno] With Kyverno, both team-internal and organization-wide policies can be defined to establish minimum security standards for managed cloud resources or to represent other corporate standards.

## External Secrets

"External Secrets Operator is a Kubernetes operator that integrates external secret management systems like AWS Secrets Manager, HashiCorp Vault, [...] and many more. The operator reads information from external APIs and automatically injects the values into a Kubernetes Secret."[^externalsecrets] In conjunction with other services like Crossplane and Flux, users can define their landscapes as templates and deploy them without code duplication. The External Secrets Operator can not only import secrets into an MCP but also push secrets generated in the MCP to other systems.

## Landscaper

"Landscaper provides the means to describe, install and maintain cloud-native landscapes. It allows you to express an order of building blocks, connect output with input data and ultimately, bring your landscape to live."[^landscaper] Operators can activate Landscaper as a service provider in their openMCP environment to ease the rollout of more complex software products for their users.

[^kubernetes]: https://kubernetes.io/
[^gardener]: https://gardener.cloud/
[^ocm]: https://ocm.software/docs/overview/about/
[^crossplane]: https://www.crossplane.io/
[^fluxcd]: https://fluxcd.io/
[^kyverno]: https://kyverno.io/
[^externalsecrets]: https://external-secrets.io/latest/
[^landscaper]: https://github.com/gardener/landscaper/blob/master/README.md
