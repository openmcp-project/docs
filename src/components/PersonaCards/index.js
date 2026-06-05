import React from 'react';
import { User, Settings, Puzzle } from 'lucide-react';

const PERSONAS = [
  {
    key: 'user',
    icon: User,
    title: 'End User',
    description: '**Create** **`ControlPlanes`**, request services, and manage your custom resources.\n\nThis requires a running platform already set up by a Platform Owner.',
    href: '/users/getting-started',
    linkLabel: 'End User Guide →',
  },
  {
    key: 'operator',
    icon: Settings,
    title: 'Platform Owner',
    description: 'Deploy and **operate the platform** infrastructure for your organization.\n\nThis gives End Users a place to create `ControlPlanes` and consume services.',
    href: '/operators/overview',
    linkLabel: 'Operators Guide →',
  },
  {
    key: 'developer',
    icon: Puzzle,
    title: 'Service Provider',
    description: 'Build and publish custom providers and service offerings.\n\nThis **extends** the platform with services that End Users can request.',
    href: '/developers/overview',
    linkLabel: 'Developer Docs →',
  },
];

function renderDescription(text) {
  const parts = text.split(/(\*\*`[^`]+`\*\*|\*\*[^*]+\*\*|`[^`]+`|\n)/g);
  return parts.map((part, i) => {
    if (part === '\n') return <br key={i} />;
    if (part.startsWith('**`') && part.endsWith('`**')) return <strong key={i}><code>{part.slice(3, -3)}</code></strong>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function PersonaCards({ active }) {
  return (
    <div className="reference-grid">
      {PERSONAS.map(({ key, icon: Icon, title, description, href, linkLabel }) => {
        const isActive = key === active;
        return (
          <div className={`reference-card${isActive ? ' reference-card--active' : ''}`} key={key}>
            <div style={{ marginBottom: '12px', color: 'var(--teal-6)' }}>
              <Icon size={48} />
            </div>
            <h3>{title}</h3>
            <p>{renderDescription(description)}</p>
            {isActive ? (
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--teal-7)' }}>
                You are here ✓
              </span>
            ) : (
              <a href={href} className="reference-link">{linkLabel}</a>
            )}
          </div>
        );
      })}
    </div>
  );
}
