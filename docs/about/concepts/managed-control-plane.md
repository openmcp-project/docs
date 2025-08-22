# Managed control planes (MCPs)

Managed Control Planes (MCPs) are at the heart of openMCP. Simply put, they're lightweight Kubernetes clusters that store the desired state and current status of various resources. All resources follow the Kubernetes Resource Model (KRM), allowing you to manage infrastructure resources, deployments, etc. using common Kubernetes tools like kubectl, kustomize, Helm, Flux, ArgoCD, and so on.
