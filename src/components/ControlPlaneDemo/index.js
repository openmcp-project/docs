import React, { useState, useEffect, useRef, useCallback } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { YAML_TEXT, CP_NAME, WORKSPACE } from './demo-config';
import ArchDiagram from './ArchDiagram';
import InteractiveTerminal from './InteractiveTerminal';
import styles from './styles.module.css';

function StepBox({ num, title, disabled, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.stepBox} ${visible ? styles.visible : ''} ${disabled ? styles.disabled : ''}`}
    >
      <div className={styles.stepHeader}>
        <div className={styles.stepBadge}>{num}</div>
        <h3 className={styles.stepTitle}>{title}</h3>
      </div>
      <div className={styles.stepContent}>{children}</div>
    </div>
  );
}

function Connector() {
  return <div className={styles.stepConnector} />;
}

// Ball animation sequence for step 5 (the reconcile flow)
// Each entry: { from, to, label, delay }
const BALL_SEQUENCE = [
  { from: 'terminal',       to: 'onboarding',      label: 'kubectl apply',       delay: 0 },
  { from: 'onboarding',     to: 'platform',        label: 'CR observed',          delay: 1400 },
  { from: 'platform',       to: 'onboarding',      label: 'acknowledged',         delay: 2600 },
  { from: 'platform',       to: 'clusterProvider', label: 'provision cluster',    delay: 3800 },
  { from: 'clusterProvider', to: 'platform',       label: 'cluster ready',        delay: 5800 },
  { from: 'platform',       to: 'controlplane',    label: 'install crossplane',   delay: 7000 },
  { from: 'controlplane',   to: 'platform',        label: 'crossplane healthy',   delay: 9200 },
  { from: 'platform',       to: 'onboarding',      label: 'CR Ready',             delay: 10400 },
];

function ControlPlaneDemoInner() {
  const [applied, setApplied] = useState(false);
  const [ballStep, setBallStep] = useState(-1);   // which ball is currently flying
  const [spawnedCP, setSpawnedCP] = useState(false);
  const [crossplaneHealthy, setCrossplaneHealthy] = useState(false);
  const [crReady, setCrReady] = useState(false);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const handleApply = useCallback(() => {
    if (applied) return;
    setApplied(true);

    BALL_SEQUENCE.forEach((seq, i) => {
      const t = setTimeout(() => {
        setBallStep(i);
        // At step 3 (cluster provider → platform), spawn the ControlPlane box
        if (i === 3) {
          setTimeout(() => setSpawnedCP(true), 900);
        }
        // At step 6 (platform → controlplane), mark crossplane healthy after ball arrives
        if (i === 5) {
          setTimeout(() => setCrossplaneHealthy(true), 1100);
        }
        // At step 7 (platform → onboarding), CR is ready
        if (i === 7) {
          setTimeout(() => setCrReady(true), 1100);
        }
      }, seq.delay);
      timersRef.current.push(t);
    });
  }, [applied]);

  const handleReset = () => {
    clearTimers();
    setApplied(false);
    setBallStep(-1);
    setSpawnedCP(false);
    setCrossplaneHealthy(false);
    setCrReady(false);
  };

  return (
    <div className={styles.demoWrapper}>

      {/* Step 1: Cluster Provider */}
      <StepBox num={1} title="The Cluster Provider — raw Kubernetes on demand">
        <p className={styles.stepDesc}>
          A <strong>Cluster Provider</strong> is the engine that creates and deletes Kubernetes clusters on request.
          OpenMCP abstracts the underlying technology (Gardener, kind, …) behind a uniform interface.
          Platform operators install one cluster provider per environment.
        </p>
        <ArchDiagram
          show={{ clusterProvider: true }}
          ballStep={-1}
          spawnedCP={false}
          crossplaneHealthy={false}
        />
      </StepBox>

      <Connector />

      {/* Step 2: Onboarding Cluster */}
      <StepBox num={2} title="The Onboarding Cluster — where you write your CRs">
        <p className={styles.stepDesc}>
          The <strong>Onboarding Cluster</strong> is the Kubernetes cluster you interact with.
          You <code>kubectl apply</code> a <code>ManagedControlPlane</code> CR here — that is the only action you need to take.
        </p>
        <ArchDiagram
          show={{ clusterProvider: true, onboarding: true }}
          ballStep={-1}
          spawnedCP={false}
          crossplaneHealthy={false}
        />
      </StepBox>

      <Connector />

      {/* Step 3: Platform Cluster */}
      <StepBox num={3} title="The Platform Cluster — where the controllers run">
        <p className={styles.stepDesc}>
          The <strong>Platform Cluster</strong> runs the <code>openmcp-operator</code>.
          It watches the Onboarding Cluster for new <code>ManagedControlPlane</code> CRs and orchestrates
          all downstream actions — cluster provisioning, component installation, status reporting.
        </p>
        <ArchDiagram
          show={{ clusterProvider: true, onboarding: true, platform: true }}
          ballStep={-1}
          spawnedCP={false}
          crossplaneHealthy={false}
        />
      </StepBox>

      <Connector />

      {/* Step 4: The YAML */}
      <StepBox num={4} title="Define your ManagedControlPlane">
        <p className={styles.stepDesc}>
          Declare what you want in a single manifest. Here you request a dedicated control plane
          with <strong>Crossplane</strong> pre-installed.
        </p>
        <pre className={styles.yamlBlock}>{YAML_TEXT}</pre>
      </StepBox>

      <Connector />

      {/* Step 5: Apply + animated flow */}
      <StepBox num={5} title="Apply — and watch the reconciliation unfold">
        <p className={styles.stepDesc}>
          Type <code>kubectl apply -f controlplane.yaml</code> and press Enter.
          Watch each message travel between components in the diagram.
        </p>
        <ArchDiagram
          show={{ clusterProvider: true, onboarding: true, platform: true }}
          ballStep={ballStep}
          spawnedCP={spawnedCP}
          crossplaneHealthy={crossplaneHealthy}
          ballSequence={BALL_SEQUENCE}
          applied={applied}
        />
        <InteractiveTerminal
          target="kubectl apply -f controlplane.yaml"
          contextLabel="onboarding-cluster"
          contextColor="#2CE0BF"
          output="managedcontrolplane.core.openmcp.cloud/my-control-plane created"
          successMsg="✓ ManagedControlPlane is Ready"
          successReady={crReady}
          pendingMsg="⟳ Waiting for reconciliation…"
          disabled={applied}
          onSubmit={handleApply}
        />
      </StepBox>

      <Connector />

      {/* Step 6: Connect to ControlPlane */}
      <StepBox num={6} title="Connect to your ControlPlane" disabled={!crReady}>
        <p className={styles.stepDesc}>
          Your <code>ManagedControlPlane</code> is ready. Switch context and verify Crossplane is running:
        </p>
        <InteractiveTerminal
          target="kubectl get deployments -n crossplane-system"
          contextLabel={`controlplane — ${CP_NAME}`}
          contextColor="#a78bfa"
          output={`NAME                      READY   UP-TO-DATE   AVAILABLE
crossplane                1/1     1            1
crossplane-rbac-manager   1/1     1            1`}
          successMsg="✓ Crossplane is installed and healthy"
          disabled={!crReady}
        />
      </StepBox>

      <Connector />

      {/* Step 7: Try it yourself */}
      <StepBox num={7} title="Try it yourself — locally with Docker">
        <p className={styles.stepDesc}>
          Ready to run this for real? The quickstart gets you a full OpenControlPlane environment
          running locally with Docker in minutes — no cloud account needed.
        </p>
        <a className={styles.ctaLink} href="/operators/quickstart">
          <div className={styles.ctaCard}>
            <div className={styles.ctaIcon}>🚀</div>
            <div className={styles.ctaText}>
              <div className={styles.ctaTitle}>Quickstart — Run locally with Docker</div>
              <div className={styles.ctaDesc}>Install OpenControlPlane, create your first ControlPlane, and deploy Crossplane — all on your laptop.</div>
            </div>
            <div className={styles.ctaArrow}>→</div>
          </div>
        </a>
      </StepBox>

    </div>
  );
}

export default function ControlPlaneDemo() {
  return (
    <BrowserOnly fallback={<div>Loading interactive demo…</div>}>
      {() => <ControlPlaneDemoInner />}
    </BrowserOnly>
  );
}
