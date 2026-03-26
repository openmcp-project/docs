import React from 'react';
import { DatabaseIcon, UserIcon, ServerIcon, StorageIcon } from './ResourceIcons';

/**
 * Self-healing section with rotating resources around control plane
 */
export const SelfHealingAnimation = ({ isActive }) => {
  return (
    <div className="selfhealing-animation-area">
      {/* Pulse rings from CP */}
      <svg
        className="cp-pulse-container"
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
      >
        <circle
          cx="50%"
          cy="50%"
          r="60"
          className={`cp-pulse-ring ${isActive ? 'animate' : ''}`}
          fill="none"
          stroke="rgba(4, 159, 154, 0.4)"
          strokeWidth="2"
        />
        <circle
          cx="50%"
          cy="50%"
          r="60"
          className={`cp-pulse-ring cp-pulse-ring-2 ${isActive ? 'animate' : ''}`}
          fill="none"
          stroke="rgba(4, 159, 154, 0.4)"
          strokeWidth="2"
        />
        <circle
          cx="50%"
          cy="50%"
          r="60"
          className={`cp-pulse-ring cp-pulse-ring-3 ${isActive ? 'animate' : ''}`}
          fill="none"
          stroke="rgba(4, 159, 154, 0.4)"
          strokeWidth="2"
        />
      </svg>

      {/* Rotating orbit path */}
      <div className={`healing-orbit ${isActive ? 'rotating' : ''}`}>
        {/* Database - position 1 (top) */}
        <div className={`healing-resource healing-resource-1 ${isActive ? 'animate' : ''}`}>
          <div className="healing-resource-icon">
            <DatabaseIcon />
          </div>
        </div>

        {/* User - position 2 (right) */}
        <div className={`healing-resource healing-resource-2 ${isActive ? 'animate' : ''}`}>
          <div className="healing-resource-icon">
            <UserIcon />
          </div>
        </div>

        {/* Server - position 3 (bottom) */}
        <div className={`healing-resource healing-resource-3 ${isActive ? 'animate' : ''}`}>
          <div className="healing-resource-icon">
            <ServerIcon />
          </div>
        </div>

        {/* Storage - position 4 (left) */}
        <div className={`healing-resource healing-resource-4 ${isActive ? 'animate' : ''}`}>
          <div className="healing-resource-icon">
            <StorageIcon />
          </div>
        </div>
      </div>
    </div>
  );
};
