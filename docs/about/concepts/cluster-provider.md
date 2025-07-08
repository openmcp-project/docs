# Cluster Providers

Cluster providers are responsible for the dynamic creation, modification, and deletion of Kubernetes clusters in an openMCP environment. They conceal certain cluster technologies (e.g., Gardener and Kubernetes-in-Docker) behind a homogeneous interface. This allows operators to install an openMCP system in different environments and on various infrastructure providers without having to adjust the other components of the system accordingly.
