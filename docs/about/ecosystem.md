---
sidebar_position: 2
---

# Ecosystem

openMCP is a platform built on top of amazing open-source projects. The major ones are listed below.

## Kubernetes

[Kubernetes](https://kubernetes.io/), also known as K8s, is an open source system for automating deployment, scaling, and management of containerized applications. openMCP not only runs on Kubernetes but also uses the Kubernetes API as the central interface for all human users as well as integrations and automations. In doing so, the components of openMCP extend the Kubernetes API through [Custom Resource Definitions (CRDs)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/), thereby enabling the use of Kubernetes for configuring more than just compute, storage, and networking resources.

## Gardener

[Gardener](https://gardener.cloud/) can deliver fully-managed Kubernetes clusters at scale on any kind of infrastructure. Examples include AWS, Azure, and GCP but also OpenStack, [IronCore](https://github.com/ironcore-dev/gardener-extension-provider-ironcore), and [Hetzner Cloud](https://github.com/23technologies/gardener-extension-provider-hcloud). Like openMCP, Gardener is a Kubernetes extension and adheres to the same principles for resiliency, manageability, observability and high automation by design. openMCP can use Gardener as a [cluster provider](concepts/cluster-provider.md).

## Open Component Model

TODO

## Crossplane

TODO

## Flux

TODO

## Kyverno

TODO

## External Secrets

TODO

## Landscaper

TODO
