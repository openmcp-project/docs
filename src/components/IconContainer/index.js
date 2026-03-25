import React from 'react';

export default function IconContainer({ children, size = 60, compact = false }) {
  return (
    <div className={`reference-icon-container reference-icon-container-standard ${compact ? 'reference-icon-container-compact' : ''}`}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        color: 'var(--ifm-color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {children}
      </div>
    </div>
  );
}
