---
sidebar_position: 1
id: overview
---

import IconContainer from '@site/src/components/IconContainer';
import { Users, Calendar, Code2, MessageSquare, Mail, FileText, Globe, Puzzle, CheckCircle, XCircle, Package, Server, Target, Rocket, ExternalLink, BookOpen } from 'lucide-react';

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
  <a href="https://github.com/openmcp-project/.github/blob/main/CONTRIBUTING.md" className="reference-link">Contributing Guide →</a>
</div>

<div className="reference-card reference-card-compact">
  <IconContainer size={48} compact>
    <MessageSquare size={48} />
  </IconContainer>
  <h3>GitHub Discussions</h3>
  <p>Browse repositories, open issues, and join discussions on GitHub.</p>
  <a href="https://github.com/orgs/openmcp-project/discussions" className="reference-link">OpenControlPlane discussions→</a>
</div>

</div>

## Special Interest Groups (SIG)

<div className="reference-grid">

<div className="reference-card reference-card-featured" style={{gridColumn: 'span 2'}}>
  <IconContainer size={60} compact>
    <Puzzle size={60} strokeWidth={2} />
  </IconContainer>
  <h3>SIG Extensibility</h3>
  <p>Make it easy to build, share, and adopt extensions - service providers, cluster providers, and platform services.</p>

  <dl className="sig-meta">
    <div><dt>Leads</dt><dd>Maximilian Techritz, Christopher Junk (SAP)</dd></div>
    <div><dt>Meetings</dt><dd>Bi-weekly &middot; Wednesday 3PM CET</dd></div>
    <div><dt>Focus</dt><dd>Service providers &middot; Cluster providers &middot; Platform services</dd></div>
  </dl>

  <div className="sig-actions">
    <a href="https://lists.neonephos.org/g/opencontrolplane-extensibility/" className="subscribe-button">
      <Mail size={18} strokeWidth={2.5} className="subscribe-button-icon" />
      <span>Subscribe to Mailing List</span>
      <span className="subscribe-button-arrow" aria-hidden="true">→</span>
    </a>
    <a href="https://github.com/openmcp-project/community/tree/main/sig-extensibility" className="sig-secondary-button">
      <BookOpen size={18} strokeWidth={2.5} className="sig-secondary-button-icon" />
      <span>View charter on GitHub</span>
      <ExternalLink size={14} strokeWidth={2.5} aria-hidden="true" />
    </a>
  </div>
</div>

</div>

### Starting a New SIG

Interested in creating a new SIG? See the [SIG template](https://github.com/openmcp-project/community/blob/main/sigs/sig-template.md) and open a [discussion](https://github.com/openmcp-project/community/discussions).

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
