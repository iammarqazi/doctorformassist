import { useState, useEffect } from 'react'
import type { SessionData } from '@/types'
import styles from './SessionForm.module.css'

interface Props {
  value: SessionData
  onChange: (data: SessionData) => void
}

export function SessionForm({ value, onChange }: Props) {
  const [wardMode, setWardMode] = useState<'WARD' | 'OPD'>(value.locationType || 'WARD')

  useEffect(() => {
    setWardMode(value.locationType || 'WARD')
  }, [value.locationType])

  const handleModeChange = (mode: 'WARD' | 'OPD') => {
    setWardMode(mode)
    const defaultValue = mode === 'WARD' ? '43' : '27'
    // Only set default if ward is currently the other mode's default, otherwise keep user's value
    if ((mode === 'WARD' && value.ward === '27') || (mode === 'OPD' && value.ward === '43')) {
      onChange({ ...value, ward: defaultValue, locationType: mode })
    } else {
      onChange({ ...value, locationType: mode })
    }
  }

  const handleWardChange = (newValue: string) => {
    const sanitized = newValue.replace(/\D/g, '').slice(0, 3)
    onChange({ ...value, ward: sanitized })
  }

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
          <label className={styles.label}>
            Location <span className={styles.required} aria-label="required">*</span>
          </label>
          <div className={styles.toggleGroup}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${wardMode === 'WARD' ? styles.toggleBtnActive : ''}`}
              onClick={() => handleModeChange('WARD')}
              aria-pressed={wardMode === 'WARD'}
            >
              WARD
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${wardMode === 'OPD' ? styles.toggleBtnActive : ''}`}
              onClick={() => handleModeChange('OPD')}
              aria-pressed={wardMode === 'OPD'}
            >
              OPD
            </button>
          </div>
          <input
            id="session-ward"
            type="text"
            inputMode="numeric"
            className={styles.input}
            placeholder={wardMode === 'WARD' ? '43' : '27'}
            value={value.ward}
            onChange={(e) => handleWardChange(e.target.value)}
            maxLength={3}
            aria-label={`${wardMode} number`}
          />
        </div>
      </div>
    </div>
  )
}
