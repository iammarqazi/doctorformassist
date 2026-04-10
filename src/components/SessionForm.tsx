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
          <label htmlFor="session-doctor" className={styles.label}>
            Doctor <span className={styles.required} aria-label="required">*</span>
          </label>
          <input
            id="session-doctor"
            type="text"
            className={styles.input}
            placeholder="Dr. Sharma"
            value={value.doctor}
            onChange={(e) => onChange({ ...value, doctor: e.target.value })}
            required
            aria-required="true"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
