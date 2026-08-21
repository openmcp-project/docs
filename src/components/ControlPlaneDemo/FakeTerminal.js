import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';

const TARGET = 'kubectl apply -f controlplane.yaml';

export default function FakeTerminal({ onApply, applied, crReady, onReset }) {
  const [typed, setTyped] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const termRef = useRef(null);

  // Reset when parent resets
  useEffect(() => {
    if (!applied) {
      setTyped('');
      setSubmitted(false);
    }
  }, [applied]);

  function handleKey(e) {
    if (submitted) return;

    // Prevent ALL default browser actions (scroll, tab, etc.)
    if (!e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
    }

    if (e.key === 'Enter') {
      if (typed.trim() === TARGET) {
        setSubmitted(true);
        onApply();
      } else {
        setTyped(''); // wrong — clear
      }
      return;
    }
    if (e.key === 'Backspace') {
      setTyped(t => t.slice(0, -1));
      return;
    }
    if (e.key.length === 1) {
      setTyped(t => t + e.key);
    }
  }

  function handleReset() {
    setTyped('');
    setSubmitted(false);
    onReset();
    setTimeout(() => termRef.current?.focus(), 50);
  }

  const isCorrectSoFar = TARGET.startsWith(typed);
  const focused = !submitted;

  return (
    <div
      ref={termRef}
      className={styles.terminalPane}
      tabIndex={0}
      onKeyDown={handleKey}
      onClick={() => !submitted && termRef.current?.focus()}
      style={{ cursor: submitted ? 'default' : 'text', outline: 'none' }}
    >
      <div className={styles.terminalBar}>
        <span className={styles.termDot} style={{ background: '#ff5f56' }} />
        <span className={styles.termDot} style={{ background: '#ffbd2e' }} />
        <span className={styles.termDot} style={{ background: '#27c93f' }} />
        <span className={styles.termTitle} style={{ color: '#2CE0BF' }}>onboarding-cluster</span>
      </div>
      <div className={styles.terminalBody}>
        {!submitted && (
          <>
            <div className={styles.termLine}>
              <span className={styles.termPrompt} style={{ color: '#2CE0BF' }}>$ </span>
              <span
                className={styles.termCmd}
                style={{ color: isCorrectSoFar ? '#dfdfd6' : '#ef4444' }}
              >
                {typed}
              </span>
              <span className={styles.cursor}>█</span>
            </div>
            {typed.length === 0 && (
              <div className={styles.termHint}>
                Click here, then type: <code>{TARGET}</code>
              </div>
            )}
          </>
        )}
        {submitted && (
          <>
            <div className={styles.termLine}>
              <span className={styles.termPrompt} style={{ color: '#2CE0BF' }}>$ </span>
              <span className={styles.termCmd}>{TARGET}</span>
            </div>
            <div className={styles.termOutput}>
              managedcontrolplane.core.openmcp.cloud/my-control-plane created
            </div>
            {crReady && (
              <div className={styles.termSuccess}>✓ ManagedControlPlane is Ready</div>
            )}
            {!crReady && (
              <div className={styles.termPending}>⟳ Waiting for reconciliation…</div>
            )}
            <button className={styles.btnSecondary} style={{ marginTop: '0.6rem' }} onClick={handleReset}>
              ↺ Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}
