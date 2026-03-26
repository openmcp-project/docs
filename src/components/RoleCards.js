import React from 'react';

const RoleCard = ({ role, icon, title, description, subtitle, href, buttonText, buttonStyle }) => (
  <div className={`project-card role-card role-card-${role}`}>
    <div className="project-card-header">
      {icon}
      <h2>{title}</h2>
    </div>
    <div className="role-card-content">
      <p className="role-card-description">{description}</p>
      <p className="role-card-subtitle">{subtitle}</p>
      <a href={href} className={`button button--primary button--lg ${buttonStyle || ''}`}>
        {buttonText}
      </a>
    </div>
  </div>
);

const UserIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const OperatorIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

const ContributorIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

export default function RoleCards() {
  return (
    <div className="role-cards-grid">
      <RoleCard
        role="enduser"
        icon={<UserIcon />}
        title="End User"
        description="Order and use control planes for your applications and teams"
        subtitle="Learn how to request control planes, connect to them, and configure services."
        href="/operators/use/overview"
        buttonText="Use Platform →"
      />
      <RoleCard
        role="operator"
        icon={<OperatorIcon />}
        title="Platform Operator"
        description="Deploy and manage OpenControlPlane installations"
        subtitle="Set up, configure, and maintain the platform for your organization."
        href="/operators/setup/overview"
        buttonText="Run Your Own Platform →"
      />
      <RoleCard
        role="contributor"
        icon={<ContributorIcon />}
        title="Contributor"
        description="Build providers and extend the OpenControlPlane ecosystem"
        subtitle="Develop service providers and contribute to the open-source project."
        href="/developers/getting-started"
        buttonText="Build Together →"
        buttonStyle="role-card-contributor-button"
      />
    </div>
  );
}
