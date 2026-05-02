import type { SessionData } from '@/types'
import styles from './SessionForm.module.css'

interface Props {
  value: SessionData
  onChange: (data: SessionData) => void
}

export function SessionForm({ value, onChange }: Props) {
  return (
    <div className={styles.card} role="group" aria-label="Session details">
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon} aria-hidden="true">📋</span>
        <h2 className={styles.cardTitle}>Session Details</h2>
        <span className={styles.badge}>Applies to all patients</span>
      </div>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="session-date" className={styles.label}>
            Date <span className={styles.required} aria-label="required">*</span>
          </label>
          <input
            id="session-date"
            type="date"
            className={styles.input}
            value={value.date}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            required
            aria-required="true"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="session-unit" className={styles.label}>
            Unit <span className={styles.required} aria-label="required">*</span>
          </label>
          <input
            id="session-unit"
            type="text"
            className={styles.input}
            placeholder="HRB"
            value={value.unit}
            onChange={(e) => onChange({ ...value, unit: e.target.value.toUpperCase() })}
            required
            aria-required="true"
            autoComplete="off"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="session-ward" className={styles.label}>
            Ward <span className={styles.required} aria-label="required">*</span>
          </label>
          <input
            id="session-ward"
            type="text"
            className={styles.input}
            placeholder="43"
            value={value.ward}
            onChange={(e) => onChange({ ...value, ward: e.target.value })}
            required
            aria-required="true"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
