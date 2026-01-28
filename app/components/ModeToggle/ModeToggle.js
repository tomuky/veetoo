'use client';

import { CALCULATION_MODES } from '../../lib/constants';
import styles from './ModeToggle.module.css';

export default function ModeToggle({ mode, onModeChange, disabled = false }) {
  return (
    <div className={styles.container}>
      <div className={styles.toggle}>
        <button
          className={`${styles.option} ${mode === CALCULATION_MODES.SINCE_LAST_ACTION ? styles.active : ''}`}
          onClick={() => onModeChange(CALCULATION_MODES.SINCE_LAST_ACTION)}
          disabled={disabled}
        >
          Since Last Action
        </button>
        <button
          className={`${styles.option} ${styles.disabled}`}
          disabled={true}
          title="Coming soon"
        >
          Full History
        </button>
      </div>
    </div>
  );
}
