import React from 'react';

export const DatabaseIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="5" rx="9" ry="3" className="resource-icon-stroke" strokeWidth="2" fill="none" />
    <path
      d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3"
      className="resource-icon-stroke"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const UserIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      className="resource-icon-stroke"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="7" r="4" className="resource-icon-stroke" strokeWidth="2" />
  </svg>
);

export const ServerIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" className="resource-icon-stroke" strokeWidth="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" className="resource-icon-stroke" strokeWidth="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" className="resource-icon-stroke" strokeWidth="2" strokeLinecap="round" />
    <line x1="6" y1="18" x2="6.01" y2="18" className="resource-icon-stroke" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const StorageIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      className="resource-icon-stroke"
      strokeWidth="2"
    />
    <polyline
      points="3.27 6.96 12 12.01 20.73 6.96"
      className="resource-icon-stroke"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="12" y1="22.08" x2="12" y2="12" className="resource-icon-stroke" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
