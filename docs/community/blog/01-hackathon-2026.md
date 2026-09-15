---
sidebar_position: 1
id: hackathon-july-2026
---

# IPCEI-CIS Hackathon July 2026

In July 2026, the OpenControlPlane team joined a hackathon at the SAP Innovation Center in Potsdam. The event brought together contributors from [NeoNephos](https://neonephos.org/) and [ApeiroRA](https://apeirora.eu/) as part of the [IPCEI-CIS](https://www.8ra.com/ipcei-cis/) initiative to develop open-source solutions for European cloud infrastructure and services.

The team worked on the following two topics during the event.

## Automated Git and OpenBao Integration

Two recurring asks from platform teams shaped this track: "How do we keep onboarding resources in sync with a git repository without running our own GitOps infrastructure?" and "How do our ControlPlanes get access to secrets without storing long-lived credentials anywhere?" During the hackathon, we tackled both.

### GitOps for Onboarding

Getting GitOps to work with OpenControlPlane's onboarding was technically possible before, but it required a lot of self-managed overhead. Teams either had to run their own Flux instance or set up a dedicated "operations" control plane just to call the onboarding API. Getting Flux up and running *inside* a ControlPlane and connecting it to git repositories was yet another set of manual steps per cluster.

The new [platform-service-gitops](https://github.com/openmcp-project/platform-service-gitops) flips this around and makes git-backed reconciliation a built-in platform feature.

- A platform owner registers a **GitHubInstance** once, storing the GitHub App credentials centrally. End users never see the private key.
- Project members create an **AppInstallation** (linking their GitHub org) and a **GitRepository** to declare which repo and branch to track.
- The controller takes it from there, propagating scoped repository access and Flux `GitRepository` resources into the target ControlPlanes automatically. Flux picks up the sync without any additional manual setup.

The result is that onboarding a new ControlPlane to GitOps goes from a multi-step manual process to a handful of config changes in the onboarding cluster.

You can find the source code and more information here: https://github.com/openmcp-project/platform-service-gitops

Please note that the implementation is a proof-of-concept and not suitable for production use!

### Passwordless Secret Access with OpenBao

The second piece, [platform-service-openbao](https://github.com/openmcp-project/platform-service-openbao), addresses how ControlPlanes get access to secrets without anyone ever creating or rotating a long-lived token.

The insight is that every ControlPlane already issues short-lived Kubernetes ServiceAccount JWTs. [OpenBao](https://openbao.org/) (the open-source fork of HashiCorp Vault) supports JWT authentication natively, so rather than minting and distributing tokens, the platform can simply configure a trust relationship: "OpenBao, when you see a JWT from this ControlPlane's issuer with this audience, trust it."

The service introduces a small set of resources:

- A **OpenBaoInstance** registers an approved OpenBao backend cluster-wide, so tenants cannot point workloads at arbitrary backends.
- A **ControlPlaneTrust** discovers the ControlPlane's OIDC issuer automatically and wires up a JWT auth mount for it.
- A **PolicyBinding** grants a specific ServiceAccount identity access to a named, user-managed policy and nothing more.

Tools in the ControlPlane like [External Secrets Operator](https://external-secrets.io/) can authenticate to OpenBao using the ServiceAccount JWT they already have, receive a short-lived OpenBao token scoped to exactly the right policy, and fetch secrets. The platform service configures the trust; it never stores a token, and it never touches the secret data itself.

You can find the source code and more information here: https://github.com/openmcp-project/platform-service-openbao

Please note that the implementation is a proof-of-concept and not suitable for production use!

## Cluster Provider GCP and CAPI

OpenControlPlane provides its own cluster abstraction to decouple OpenControlPlane from a specific cloud vendor or bare-metal Kubernetes solution, allowing [Platform Owners](../../operators/00-overview.md) to switch providers if needed.

We currently support [gardener](https://gardener.cloud/) for production use and [kind](https://kind.sigs.k8s.io/) for local testing and development. In the context of the hackathon, we wanted to demonstrate how the [Cluster Provider](../../developers/clusterprovider/01-design.mdx) extension point can be used to integrate with a specific cloud vendor without the gardener indirection. Additionally, we wanted to demonstrate that OpenControlPlane's cluster abstraction enables integration into existing ecosystems like [Cluster API](https://cluster-api.sigs.k8s.io/).

As a result, two new cluster providers have been implemented:

- [Cluster Provider GCP](https://github.com/openmcp-project/cluster-provider-gcp-hackathon) allows platform owners to use [GCP](https://cloud.google.com/) directly without gardener to request clusters in OpenControlPlane.
- [Cluster Provider CAPI](https://github.com/openmcp-project/cluster-provider-capi-hackathon) allows platform owners to use existing [Cluster API Providers](https://cluster-api.sigs.k8s.io/reference/providers.html) to request clusters in OpenControlPlane.

---

*Parts of this blog post were written with the help of [Claude](https://claude.ai).*
