# Service Providers

This guide shows you how to create Service Provider for the OpenMCP ecosystem from scratch. Service Providers are the heart of the OpenMCP platform, as they provide the capabilities to offer Infrastructure as Data services to end users.

In this guide, we will walk you through the steps of creating a Service Provider using Velero as an example. Velero is a popular open-source tool for backup and recovery of Kubernetes resources and persistent volumes.

## What can you expect?
At the end of this guide, you will have created a fully functional service-provider-velero that can be deployed in an OpenMCP landscape. You will have learned how to:
- Set up the project structure for a Service Provider
- Implement the necessary components for the Service Provider
- Package and deploy the Service Provider in an OpenMCP landscape
- Test the Service Provider to ensure it works as expected

Let's get started!

## Overview
Picture what service-provider-velero will offer once completed:
- Created an end-user facing `Velero` CRD for the Onboarding API to order a Velero Service instance in your `ManagedControlPlane`
- Implement a Controller that reconciles `Velero` Service Resources and that handles the lifecycle of Velero instances in `ManagedControlPlane` API.
- Service Instance CRDs will be registered on end-users ManagedControlPlane
- Velero itself will run the ManagedControlPlane
- Optional: Velero itself will run in shared workload cluster and reconcile the Service Instance CRDs

## Prerequisites
Go to https://github.com/openmcp-project/service-provider-template and use this template repository to create a new repository for your Service Provider. You can do this by clicking on the "Use this template" button on the GitHub page.
In our case, we will call the new repository `service-provider-velero`.

Check out the newly created repository to your local machine and open it in your favorite IDE.
Make sure you have Go installed on your machine. You can download it from https://golang.org/dl/.

Run the following command to execute the template.
```bash
go run ./cmd/template -module github.com/openmcp-project/service-provider-velero -kind Velero -group velero
```