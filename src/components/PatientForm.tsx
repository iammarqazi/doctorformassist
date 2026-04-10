import { useState } from 'react'
import { TESTS } from '@/constants/tests'
import type { TestId } from '@/types'
import styles from './PatientForm.module.css'

interface Props {
  onAdd: (name: string, tests: TestId[]) => void
  disabled?: boolean
}

export function PatientForm({ onAdd, disabled }: Props) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<Set<TestId>>(new Set())
  const [errors, setErrors] = useState<{ name?: string; tests?: string }>({})

  const toggleTest = (id: TestId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setErrors((e) => ({ ...e, tests: undefined }))
  }

  const selectAll = () => setSelected(new Set(TESTS.map((t) => t.id)))
  const clearAll = () => setSelected(new Set())

  const handleAdd = () => {
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = 'Patient name is required'
    if (selected.size === 0) errs.tests = 'Select at least one test'
    if (Object.keys(errs).length) { setErrors(errs); return }

    onAdd(name.trim(), Array.from(selected))
    setName('')
    setSelected(new Set())
    setErrors({})
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon} aria-hidden="true">👤</span>
        <h2 className={styles.cardTitle}>Add Patient</h2>
      </div>

      {/* Patient Name */}
      <div className={styles.nameField}>
        <label htmlFor="patient-name" className={styles.label}>
          Patient Name <span className={styles.required}>*</span>
        </label>
        <input
          id="patient-name"
          type="text"
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          placeholder="e.g. Rahul Mehta"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((er) => ({ ...er, name: undefined })) }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          disabled={disabled}
          autoComplete="off"
        />
        {errors.name && <span id="name-error" className={styles.errorMsg} role="alert">{errors.name}</span>}
      </div>

      {/* Tests */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          <span>Essential Tests</span>
          <span className={styles.required}> *</span>
          <div className={styles.selectors}>
            <button type="button" className={styles.selectBtn} onClick={selectAll} disabled={disabled}>All</button>
            <button type="button" className={styles.selectBtn} onClick={clearAll} disabled={disabled}>None</button>
          </div>
        </legend>

        {errors.tests && (
          <span className={styles.errorMsg} role="alert">{errors.tests}</span>
        )}

        <div className={styles.checkboxGrid}>
          {TESTS.map((test) => (
            <label
              key={test.id}
              className={`${styles.checkLabel} ${selected.has(test.id) ? styles.checked : ''}`}
            >
              <input
                type="checkbox"
                className={styles.checkInput}
                checked={selected.has(test.id)}
                onChange={() => toggleTest(test.id)}
                disabled={disabled}
                aria-label={test.label}
              />
              <span className={styles.checkBox} aria-hidden="true">
                {selected.has(test.id) && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span className={styles.checkText}>{test.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        className={styles.addBtn}
        onClick={handleAdd}
        disabled={disabled}
        aria-label={`Add patient ${name || ''} to queue`}
      >
        <span>+ Add to Queue</span>
        {selected.size > 0 && (
          <span className={styles.countPill}>{selected.size} PDF{selected.size > 1 ? 's' : ''}</span>
        )}
      </button>
    </div>
  )
}
