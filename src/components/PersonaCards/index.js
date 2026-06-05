import React from 'react';
import { User, Settings, Puzzle } from 'lucide-react';

const PERSONAS = [
  {
    key: 'user',
    icon: User,
    title: 'End User',
    description: 'Your platform is already set up. Create `ControlPlanes`, request services, and manage your custom resources.',
    href: '/users/getting-started',
    linkLabel: 'End User Guide →',
  },
  {
    key: 'operator',
    icon: Settings,
    title: 'Platform Owner',
    description: 'Deploy and operate OpenControlPlane for your teams. Configure providers and set up the platform infrastructure.',
    href: '/operators/overview',
    linkLabel: 'Operators Guide →',
  },
  {
    key: 'developer',
    icon: Puzzle,
    title: 'Service Provider',
    description: 'Build and publish services on OpenControlPlane. Extend the platform with custom providers and offerings.',
    href: '/developers/overview',
    linkLabel: 'Developer Docs →',
  },
];

function renderDescription(text) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={i}>{part.slice(1, -1)}</code>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
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
