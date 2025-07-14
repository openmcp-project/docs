# Managed Control Planes (MCPs)

Managed Control Planes (MCPs) are at the heart of openMCP. Simply put, they are lightweight Kubernetes clusters that store the desired state and current status of various resources. All resources follow the Kubernetes Resource Model (KRM), allowing infrastructure resources, deployments, etc., to be managed with common Kubernetes tools like kubectl, kustomize, Helm, Flux, ArgoCD, and so on.
