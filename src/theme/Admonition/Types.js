import React from 'react';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';

function ApplyTo({ children, title, color }) {
  return (
    <div style={{
      border: `2px solid ${color}`,
      borderRadius: 5,
      marginBottom: 'var(--ifm-leading)',
    }}>
      <h5 style={{
        fontSize: 15,
        marginLeft: 5,
        marginTop: 5,
        color: 'gray',
        fontStyle: 'italic',
      }}>
        Apply to {title}
      </h5>
      <div style={{ paddingLeft: 5, paddingRight: 5 }}>
        {children}
      </div>
    </div>
  );
}

function ApplyToOnboardingAPI({ children, title }) {
  return <ApplyTo title={title || 'Onboarding API'} color="#2E8B5780">{children}</ApplyTo>;
}

function ApplyToGardener({ children, title }) {
  return <ApplyTo title={title || 'Gardener'} color="#10a37a80">{children}</ApplyTo>;
}

function ApplyToPlatform({ children, title }) {
  return <ApplyTo title={title || 'Platform Cluster'} color="#E8730080">{children}</ApplyTo>;
}

function ApplyToControlPlane({ children, title }) {
  return <ApplyTo title={title || 'ControlPlane Cluster'} color="#7B2D8B80">{children}</ApplyTo>;
}

const AdmonitionTypes = {
  ...DefaultAdmonitionTypes,
  'apply-to-onboarding-api': ApplyToOnboardingAPI,
  'apply-to-gardener': ApplyToGardener,
  'apply-to-platform': ApplyToPlatform,
  'apply-to-controlplane': ApplyToControlPlane,
  'apply-to': ApplyTo,
};

export default AdmonitionTypes;
