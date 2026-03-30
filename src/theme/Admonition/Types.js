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
      <div style={{
        paddingLeft: 5,
        paddingRight: 5,
      }}>
        {children}
      </div>
    </div>
  );
}

function ApplyToControlPlane({ children, title }) {
  return <ApplyTo title={title || 'ControlPlane'} color="#049F9A80">{children}</ApplyTo>;
}

function ApplyToOnboardingAPI({ children, title }) {
  return <ApplyTo title={title || 'Onboarding API'} color="#2E8B5780">{children}</ApplyTo>;
}

function RunInTerminal({ children }) {
  return (
    <div style={{
      border: '2px solid #6c757d80',
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
        Run in terminal
      </h5>
      <div style={{
        paddingLeft: 5,
        paddingRight: 5,
      }}>
        {children}
      </div>
    </div>
  );
}

const AdmonitionTypes = {
  ...DefaultAdmonitionTypes,
  'apply-to-controlplane': ApplyToControlPlane,
  'apply-to-onboarding-api': ApplyToOnboardingAPI,
  'run-in-terminal': RunInTerminal,
};

export default AdmonitionTypes;
