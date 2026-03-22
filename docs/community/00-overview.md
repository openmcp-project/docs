---
sidebar_position: 1
---

import IconContainer from '@site/src/components/IconContainer';
import { Users, Calendar, Code2, MessageSquare, Mail, FileText, Globe, Puzzle, CheckCircle, XCircle, Package, Server, Target, Rocket } from 'lucide-react';

# Community

Welcome to the OpenControlPlane community! We're building an open platform for managing cloud infrastructure and services, and we'd love for you to join us.

## Get Involved

<div className="reference-grid">

<div className="reference-card reference-card-compact">
  <IconContainer size={48} compact>
    <Code2 size={48} />
  </IconContainer>
  <h3>Contribute Code</h3>
  <p>Check our contributing guide and start making your first contribution to the project.</p>
  <a href="https://github.com/openmcp-project/community/blob/main/CONTRIBUTING.md" className="reference-link">Contributing Guide →</a>
</div>

<div className="reference-card reference-card-compact">
  <IconContainer size={48} compact>
    <MessageSquare size={48} />
  </IconContainer>
  <h3>GitHub Discussions</h3>
  <p>Browse repositories, open issues, and join discussions on GitHub.</p>
  <a href="https://github.com/openmcp-project" className="reference-link">openmcp-project →</a>
</div>

</div>

## SIG Extensibility

Special Interest Group focused on making it easy to build, share, and adopt extensions—service providers, cluster providers, and platform services.

<div className="reference-grid">

<div className="reference-card reference-card-featured" style={{gridColumn: 'span 2'}}>
  <IconContainer size={70} compact>
    <Puzzle size={70} strokeWidth={2} />
  </IconContainer>
  <h3>SIG Extensibility</h3>
  <p>Make it easy to build, share, and adopt extensions—service providers, cluster providers, and platform services.</p>

  <div className="sig-details">
    <div><strong>Leads:</strong> Maximilian Techritz, Christopher Junk (SAP)</div>
    <div><strong>Meetings:</strong> Bi-weekly, Wednesday 3PM CET</div>
    <div><strong>Mailing List:</strong> openMCP-extensibility@lists.neonephos.org</div>
  </div>

  <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px'}}>
    <a href="https://github.com/openmcp-project/community/tree/main/sig-extensibility" className="reference-link">View Charter</a>
    <a href="mailto:openMCP-extensibility@lists.neonephos.org" className="reference-link">Subscribe</a>
  </div>
</div>

</div>

### Scope

**In scope:**
- Developer tooling: templates, frameworks, SDKs
- Increasing service options for end users
- Technical standardization for extensibility

**Out of scope:**
- Core APIs (ServiceProvider, ClusterProvider, etc.)
- Fundamental platform services (e.g., platform-service-gateway)

### Subprojects

**Service Providers:**
- [Crossplane service provider](https://github.com/openmcp-project/service-provider-crossplane)
- [Landscaper service provider](https://github.com/openmcp-project/service-provider-landscaper)
- [Velero service provider](https://github.com/openmcp-project/service-provider-velero)
- [Service provider template](https://github.com/openmcp-project/repository-template)

**Cluster Providers:**
- [Gardener cluster provider](https://github.com/openmcp-project/cluster-provider-gardener)
- [Kind cluster provider](https://github.com/openmcp-project/cluster-provider-kind)
- Testing infrastructure

### Starting a New SIG

Interested in creating a new SIG? See the [SIG template](https://github.com/openmcp-project/community/blob/main/sigs/sig-template.md) and open a [discussion](https://github.com/openmcp-project/community/discussions) in the community repository.

## Code of Conduct

We follow the [Contributor Covenant Code of Conduct](https://github.com/openmcp-project/.github/blob/main/CODE_OF_CONDUCT.md) to maintain a welcoming and harassment-free environment for everyone.

## Related Communities

<div className="reference-grid">

<div className="reference-card reference-card-compact">
  <IconContainer size={44} compact>
    <Globe size={44} />
  </IconContainer>
  <h3>ApeiroRA</h3>
  <p>European cloud initiative promoting open-source cloud technologies.</p>
  <a href="https://apeirora.eu/" className="reference-link">Visit Website →</a>
</div>

<div className="reference-card reference-card-compact">
  <IconContainer size={44} compact>
    <Globe size={44} />
  </IconContainer>
  <h3>NeoNephos</h3>
  <p>Cloud-native ecosystem for next-generation infrastructure.</p>
  <a href="https://neonephos.org/" className="reference-link">Visit Website →</a>
</div>

</div>
