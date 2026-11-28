import React, { useId, useState } from 'react';
import { Check } from 'lucide-react';
import styles from './styles.module.css';

/**
 * @typedef {Object} ChecklistItem
 * @property {string} id Unique, stable identifier within the checklist.
 * @property {React.ReactNode} title Checkbox label.
 * @property {React.ReactNode} [description] Supporting text, links, or other content.
 * @property {boolean} [expandable=false] Show the description in a collapsed disclosure.
 */

/**
 * An accessible, page-local checklist with a progress bar.
 * @param {{items: ChecklistItem[], title?: string}} props
 */
export default function Checklist({ items, title = 'Checklist' }) {
  const instanceId = useId();
  const [checkedIds, setCheckedIds] = useState(() => new Set());
  const completed = items.filter(({ id }) => checkedIds.has(id)).length;

  function toggle(id) {
    setCheckedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className={styles.checklist} aria-label={title}>
      <div className={styles.header}>
        <strong>{title}</strong>
      </div>
      <progress
        className={styles.progress}
        value={completed}
        max={items.length || 1}
        aria-label={`${title} progress`}
      />
      <ul className={styles.items}>
        {items.map(({ id, title: itemTitle, description, expandable = false }, index) => {
          const inputId = `${instanceId}-${id}`;
          const checked = checkedIds.has(id);
          const descriptionContent = description && (
            <div className={styles.description} id={`${inputId}-description`}>
              {description}
            </div>
          );
          return (
            <li className={`${styles.item} ${checked ? styles.checked : ''}`} key={id}>
              <div className={styles.itemHeader}>
                <span className={styles.control}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    id={inputId}
                    checked={checked}
                    onChange={() => toggle(id)}
                    aria-describedby={description && !expandable ? `${inputId}-description` : undefined}
                  />
                  <span className={styles.number} aria-hidden="true">
                    {checked ? <Check size={16} strokeWidth={3} /> : index + 1}
                  </span>
                </span>
                <label className={styles.label} htmlFor={inputId}>{itemTitle}</label>
              </div>
              {descriptionContent && (expandable ? (
                <details className={styles.details}>
                  <summary>Instructions</summary>
                  {descriptionContent}
                </details>
              ) : descriptionContent)}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
