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

<div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>

<div className="reference-card" style={{flexDirection: 'row', alignItems: 'flex-start', gap: '20px', padding: '24px 28px', textAlign: 'left', borderLeft: '4px solid #049f9a'}}>
  <div style={{flexShrink: 0, color: '#049f9a', paddingTop: '2px'}}>
    <Server size={32} strokeWidth={1.75} />
  </div>
  <div style={{flex: 1}}>
    <h3 style={{marginBottom: '4px', fontSize: '1.1rem'}}>SIG Core</h3>
    <p style={{marginBottom: '12px', fontSize: '0.9rem'}}>Owns the foundational APIs and controllers of OpenControlPlane — including `ControlPlane`, `ServiceProvider`, `ClusterProvider`, and `PlatformService`.</p>
    <div style={{display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '14px', flexWrap: 'wrap'}}>
      <span><strong>Leads:</strong> Radek Schekalla, Maximilian Techritz</span>
      <span><strong>Meetings:</strong> Bi-weekly · Wed 3PM CET</span>
      <span><strong>Focus:</strong> Core APIs · Controllers</span>
    </div>
    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
      <a href="https://lists.neonephos.org/g/opencontrolplane-core/" className="reference-link" style={{fontSize: '0.85rem'}}>Subscribe to Mailing List →</a>
      <a href="https://github.com/openmcp-project/community/tree/main/sig-core" className="reference-link" style={{fontSize: '0.85rem'}}>Charter on GitHub →</a>
      <a href="https://github.com/orgs/openmcp-project/discussions/categories/community-calls" className="reference-link" style={{fontSize: '0.85rem'}}>Community Calls →</a>
    </div>
  </div>
</div>

<div className="reference-card" style={{flexDirection: 'row', alignItems: 'flex-start', gap: '20px', padding: '24px 28px', textAlign: 'left', borderLeft: '4px solid #049f9a'}}>
  <div style={{flexShrink: 0, color: '#049f9a', paddingTop: '2px'}}>
    <Puzzle size={32} strokeWidth={1.75} />
  </div>
  <div style={{flex: 1}}>
    <h3 style={{marginBottom: '4px', fontSize: '1.1rem'}}>SIG Extensibility</h3>
    <p style={{marginBottom: '12px', fontSize: '0.9rem'}}>Make it easy to build, share, and adopt extensions — service providers, cluster providers, and platform services.</p>
    <div style={{display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '14px', flexWrap: 'wrap'}}>
      <span><strong>Leads:</strong> Maximilian Techritz, Christopher Junk</span>
      <span><strong>Meetings:</strong> Bi-weekly · Wed 3PM CET</span>
      <span><strong>Focus:</strong> Providers · Extensions</span>
    </div>
    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
      <a href="https://lists.neonephos.org/g/opencontrolplane-extensibility/" className="reference-link" style={{fontSize: '0.85rem'}}>Subscribe to Mailing List →</a>
      <a href="https://github.com/openmcp-project/community/tree/main/sig-extensibility" className="reference-link" style={{fontSize: '0.85rem'}}>Charter on GitHub →</a>
      <a href="https://github.com/orgs/openmcp-project/discussions/categories/community-calls" className="reference-link" style={{fontSize: '0.85rem'}}>Community Calls →</a>
    </div>
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
