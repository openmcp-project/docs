import React, { useEffect, useRef } from 'react';
import styles from './styles.module.css';

const COLORS = {
  onboarding:      '#2CE0BF',
  platform:        '#60a5fa',
  clusterProvider: '#f59e0b',
  controlplane:    '#a78bfa',
  terminal:        '#98989f',
};

// Box layout (viewBox 100x70)
// Left col: Onboarding (top), Platform (mid)
// Right col: ControlPlane (tall)
// Bottom: ClusterProvider spans full width
const BOXES = {
  onboarding:      { x: 2,  y: 2,  w: 44, h: 22 },
  platform:        { x: 2,  y: 28, w: 44, h: 22 },
  clusterProvider: { x: 2,  y: 56, w: 96, h: 12 },
  controlplane:    { x: 54, y: 2,  w: 44, h: 48 },
};

function boxCenter(key) {
  // 'terminal' is below the diagram — map it to just outside the bottom of onboarding box
  if (key === 'terminal') {
    const ob = BOXES.onboarding;
    return { x: ob.x + ob.w / 2, y: 75 }; // below viewBox bottom (70), ball animates in from below
  }
  const b = BOXES[key];
  if (!b) return { x: 50, y: 35 };
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

// Animated ball as a React component using requestAnimationFrame
function Ball({ from, to, color, onDone }) {
  const circleRef = useRef(null);
  const startRef = useRef(null);
  const DURATION = 900; // ms

  useEffect(() => {
    const fc = boxCenter(from);
    const tc = boxCenter(to);

    function frame(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      // ease in-out
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const cx = fc.x + (tc.x - fc.x) * ease;
      const cy = fc.y + (tc.y - fc.y) * ease;
      const opacity = t < 0.85 ? 1 : (1 - t) / 0.15;
      if (circleRef.current) {
        circleRef.current.setAttribute('cx', cx);
        circleRef.current.setAttribute('cy', cy);
        circleRef.current.setAttribute('opacity', opacity);
      }
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        if (onDone) onDone();
      }
    }
    requestAnimationFrame(frame);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fc = boxCenter(from);
  return (
    <circle
      ref={circleRef}
      cx={fc.x}
      cy={fc.y}
      r="2"
      fill={color}
    />
  );
}

function BoxSvg({ id, show, spawned, healthy, applied }) {
  if (!show && !spawned) return null;
  const b = BOXES[id];
  const color = COLORS[id];

  return (
    <g className={spawned && !show ? styles.svgPopIn : undefined}>
      <rect
        x={b.x} y={b.y} width={b.w} height={b.h}
        rx="2"
        fill="#1a1a1f"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.95"
      />
      {/* label */}
      <text
        x={b.x + 2} y={b.y + 5}
        fontSize="3"
        fontWeight="bold"
        fill={color}
        style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
      >
        {id === 'onboarding' ? 'Onboarding Cluster' :
         id === 'platform' ? 'Platform Cluster' :
         id === 'clusterProvider' ? 'Cluster Provider' :
         'ControlPlane Cluster'}
      </text>
      {/* CR resource card inside onboarding box after apply */}
      {id === 'onboarding' && applied && (
        <g className={styles.svgPopIn}>
          <rect x={b.x + 2} y={b.y + 8} width={b.w - 4} height="12" rx="1.5" fill="#0d1a14" stroke="#2CE0BF" strokeWidth="0.5" />
          <text x={b.x + 4} y={b.y + 12} fontSize="2.2" fill="#2CE0BF" fontWeight="bold">ManagedControlPlane</text>
          <text x={b.x + 4} y={b.y + 15.5} fontSize="2.2" fill="#dfdfd6">name: my-control-plane</text>
          <text x={b.x + 4} y={b.y + 18.5} fontSize="2" fill="#98989f">namespace: my-workspace</text>
        </g>
      )}
      {id === 'clusterProvider' && (
        <>
          <text x={b.x + 2} y={b.y + 9} fontSize="2.4" fill="#6a6a71">e.g. Gardener</text>
          <TagRect x={b.x + 24} y={b.y + 5.5} label="provisions K8s clusters" />
        </>
      )}
      {/* tags */}
      {id === 'onboarding' && (
        <>
          <TagRect x={b.x + 2} y={b.y + 11} label="kubectl" />
          <TagRect x={b.x + 2} y={b.y + 17} label="ManagedControlPlane CR" />
        </>
      )}
      {id === 'platform' && (
        <TagRect x={b.x + 2} y={b.y + 11} label="openmcp-operator" />
      )}
      {id === 'controlplane' && (
        <>
          <TagRect x={b.x + 2} y={b.y + 11} label="Kubernetes API" />
          <TagRect x={b.x + 2} y={b.y + 17} label="your resources" />
          {healthy && (
            <>
              <circle cx={b.x + 3} cy={b.y + 24} r="1.2" fill="#2CE0BF" />
              <text x={b.x + 6} y={b.y + 25.5} fontSize="2.5" fill="#2CE0BF" fontWeight="bold">crossplane — healthy</text>
            </>
          )}
        </>
      )}
    </g>
  );
}

function TagRect({ x, y, label }) {
  return (
    <g>
      <rect x={x} y={y} width={label.length * 1.55 + 2} height="4.5" rx="1" fill="#2a2a30" />
      <text x={x + 1} y={y + 3.2} fontSize="2.4" fill="#98989f">{label}</text>
    </g>
  );
}

export default function ArchDiagram({
  show = {},
  ballStep = -1,
  spawnedCP = false,
  crossplaneHealthy = false,
  ballSequence = [],
  applied = false,
}) {
  const currentBall = ballStep >= 0 && ballStep < ballSequence.length
    ? ballSequence[ballStep]
    : null;

  return (
    <div className={styles.archWrapper}>
      <svg
        viewBox="0 0 100 70"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <BoxSvg id="clusterProvider" show={show.clusterProvider} spawned={false} applied={applied} />
        <BoxSvg id="onboarding"      show={show.onboarding}      spawned={false} applied={applied} />
        <BoxSvg id="platform"        show={show.platform}        spawned={false} applied={applied} />
        <BoxSvg id="controlplane"    show={false}                spawned={spawnedCP} healthy={crossplaneHealthy} applied={applied} />

        {currentBall && (
          <Ball
            key={ballStep}
            from={currentBall.from}
            to={currentBall.to}
            color={COLORS[currentBall.from] || '#fff'}
          />
        )}
      </svg>

      {currentBall && (
        <div className={styles.ballLabel}>{currentBall.label}</div>
      )}
    </div>
  );
}
