---
sidebar_position: 0
---

# Welcome

OpenControlPlane is a platform that lets you create and manage **Kubernetes-based control planes for your teams**. Think of it as a way to deliver cloud services to your organization—*everything from databases and message queues to CI/CD pipelines and monitoring tools*—**all through a unified Kubernetes API**.

## Choose Your Path

Our documentation is organized by role to help you find what you need quickly. Select your path to jump directly to the most relevant content:

<div className="ecosystem-grid" style={{marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '1200px'}}>

<div className="project-card" style={{textAlign: 'center', padding: '28px', borderColor: 'var(--role-enduser-primary)', display: 'flex', flexDirection: 'column'}}>
  <div className="project-card-header" style={{borderBottom: 'none', flexDirection: 'column', gap: '12px', paddingBottom: 0}}>
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--role-enduser-primary)'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    <h2 style={{margin: 0, fontSize: '1.5rem'}}>End User</h2>
  </div>
  <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
    <p style={{marginTop: '16px', marginBottom: '12px', fontWeight: 600, color: 'var(--ifm-color-emphasis-900)'}}>
      Order and use control planes for your applications and teams
    </p>
    <p style={{marginBottom: '24px', fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-700)', flex: 1}}>
      Learn how to request control planes, connect to them, and configure services.
    </p>
    <a href="/operators/use/overview" className="button button--primary button--lg" style={{width: '100%', whiteSpace: 'nowrap', background: 'var(--role-enduser-primary)', borderColor: 'var(--role-enduser-primary)'}}>Use Platform →</a>
  </div>
</div>

<div className="project-card" style={{textAlign: 'center', padding: '28px', borderColor: 'var(--role-operator-primary)', display: 'flex', flexDirection: 'column'}}>
  <div className="project-card-header" style={{borderBottom: 'none', flexDirection: 'column', gap: '12px', paddingBottom: 0}}>
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--role-operator-primary)'}}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
    <h2 style={{margin: 0, fontSize: '1.5rem'}}>Platform Operator</h2>
  </div>
  <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
    <p style={{marginTop: '16px', marginBottom: '12px', fontWeight: 600, color: 'var(--ifm-color-emphasis-900)'}}>
      Deploy and manage OpenControlPlane installations
    </p>
    <p style={{marginBottom: '24px', fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-700)', flex: 1}}>
      Set up, configure, and maintain the platform for your organization.
    </p>
    <a href="/operators/setup/overview" className="button button--primary button--lg" style={{width: '100%', whiteSpace: 'normal', background: 'var(--role-operator-primary)', borderColor: 'var(--role-operator-primary)', padding: '0.75rem 1rem', lineHeight: '1.3'}}>Run Your Own Platform →</a>
  </div>
</div>

<div className="project-card" style={{textAlign: 'center', padding: '28px', borderColor: '#000', display: 'flex', flexDirection: 'column'}}>
  <div className="project-card-header" style={{borderBottom: 'none', flexDirection: 'column', gap: '12px', paddingBottom: 0}}>
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#000'}}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
    <h2 style={{margin: 0, fontSize: '1.5rem'}}>Contributor</h2>
  </div>
  <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
    <p style={{marginTop: '16px', marginBottom: '12px', fontWeight: 600, color: 'var(--ifm-color-emphasis-900)'}}>
      Build providers and extend the OpenControlPlane ecosystem
    </p>
    <p style={{marginBottom: '24px', fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-700)', flex: 1}}>
      Develop service providers and contribute to the open-source project.
    </p>
    <a href="/developers/getting-started" className="button button--primary button--lg" style={{width: '100%', whiteSpace: 'nowrap', background: '#000', borderColor: '#000', color: '#fff'}}>Build Together →</a>
  </div>
</div>

</div>

## Quick Reference

<div className="reference-grid">

<div className="reference-card reference-card-compact">
  <h3>Core Concepts</h3>
  <p>Understand how OpenControlPlane works.</p>
  <a href="/users/concepts/managed-control-plane" className="reference-link">Learn Concepts →</a>
</div>

<div className="reference-card reference-card-compact">
  <h3>Browse CRDs</h3>
  <p>Explore the complete API reference with examples.</p>
  <a href="/reference/overview" className="reference-link">CRD Browser →</a>
</div>

<div className="reference-card reference-card-compact">
  <h3>Community</h3>
  <p>Connect with other users and contributors.</p>
  <a href="/community/overview" className="reference-link">Join Community →</a>
</div>

</div>

## Need Help?

- **Community**: Join our [community hub](/community/overview) to connect with other users
- **GitHub**: Report issues or browse repositories at [openmcp-project](https://github.com/openmcp-project)
- **Support**: Check the [contributing guide](https://github.com/openmcp-project/community/blob/main/CONTRIBUTING.md) for ways to get help
