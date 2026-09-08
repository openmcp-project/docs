import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';

/**
 * Generic interactive terminal — user types the target command themselves.
 * Props:
 *   target: string        — the exact command they must type
 *   contextLabel: string  — shown in the terminal title bar
 *   contextColor: string  — color for prompt + title
 *   output: string        — output shown after correct Enter (pre-formatted)
 *   successMsg: string    — optional green line shown when successReady=true
 *   successReady: bool    — when true, shows successMsg (for async flows)
 *   pendingMsg: string    — shown while successReady is false after submit
 *   disabled: bool        — greys out + blocks input
 *   onSubmit: fn          — called when correct command is entered
 */
export default function InteractiveTerminal({
  target,
  contextLabel,
  contextColor = '#2CE0BF',
  output,
  successMsg,
  successReady = true,
  pendingMsg,
  disabled = false,
  onSubmit,
}) {
  const [typed, setTyped] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const termRef = useRef(null);

  // Auto-focus when enabled
  useEffect(() => {
    if (!disabled && !submitted && termRef.current) {
      termRef.current.focus();
    }
  }, [disabled, submitted]);

  // Reset when disabled flips back to true (parent reset)
  const prevDisabled = useRef(disabled);
  useEffect(() => {
    if (!prevDisabled.current && disabled) {
      setTyped('');
      setSubmitted(false);
    }
    prevDisabled.current = disabled;
  }, [disabled]);

  function handleKey(e) {
    if (disabled || submitted) return;
    if (!e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
    }
    if (e.key === 'Enter') {
      if (typed.trim() === target) {
        setSubmitted(true);
        if (onSubmit) onSubmit();
      } else {
        setTyped('');
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

  const isCorrectSoFar = target.startsWith(typed);

  return (
    <div
      ref={termRef}
      className={styles.terminalPane}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKey}
      onClick={() => !disabled && !submitted && termRef.current?.focus()}
      style={{ cursor: disabled || submitted ? 'default' : 'text', outline: 'none' }}
    >
      <div className={styles.terminalBar}>
        <span className={styles.termDot} style={{ background: '#ff5f56' }} />
        <span className={styles.termDot} style={{ background: '#ffbd2e' }} />
        <span className={styles.termDot} style={{ background: '#27c93f' }} />
        <span className={styles.termTitle} style={{ color: contextColor }}>{contextLabel}</span>
      </div>
      <div className={styles.terminalBody}>
        {!submitted && (
          <>
            <div className={styles.termLine}>
              <span className={styles.termPrompt} style={{ color: contextColor }}>$ </span>
              <span className={styles.termCmd} style={{ color: isCorrectSoFar ? '#dfdfd6' : '#ef4444' }}>
                {typed}
              </span>
              {!disabled && <span className={styles.cursor}>█</span>}
            </div>
            {typed.length === 0 && (
              <div className={styles.termHint}>
                {disabled
                  ? '(complete the previous step first)'
                  : <span>Click here, then type: <code>{target}</code></span>}
              </div>
            )}
          </>
        )}
        {submitted && (
          <>
            <div className={styles.termLine}>
              <span className={styles.termPrompt} style={{ color: contextColor }}>$ </span>
              <span className={styles.termCmd}>{target}</span>
            </div>
            {output && <pre className={styles.termOutput}>{output}</pre>}
            {successMsg && successReady && (
              <div className={styles.termSuccess}>{successMsg}</div>
            )}
            {pendingMsg && !successReady && (
              <div className={styles.termPending}>{pendingMsg}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
