import { useState } from 'react'
import { TESTS } from '@/constants/tests'
import type { TestId } from '@/types'
import styles from './PatientForm.module.css'

interface Props {
  onAdd: (
    name: string,
    age: number,
    gender: 'Male' | 'Female',
    inpatientNo: string,
    vacutainerLabel: boolean,
    tests: TestId[],
    additionalTests: string
  ) => void
  disabled?: boolean
}

export function PatientForm({ onAdd, disabled }: Props) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('')
  const [inpatientNo, setInpatientNo] = useState('')
  const [vacutainerLabel, setVacutainerLabel] = useState(false)
  const [selected, setSelected] = useState<Set<TestId>>(new Set())
  const [additionalTests, setAdditionalTests] = useState('')
  const [errors, setErrors] = useState<{ name?: string; age?: string; gender?: string; inpatientNo?: string; tests?: string }>({})

  const toggleTest = (id: TestId) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setErrors((e) => ({ ...e, tests: undefined }))
  }

  const selectAll = () => setSelected(new Set(TESTS.map((t) => t.id)))
  const clearAll  = () => setSelected(new Set())

  const handleAdd = () => {
    const errs: typeof errors = {}
    const trimmedName = name.trim()
    if (!trimmedName) errs.name = 'Name is required'
    else if (trimmedName.length > 11) errs.name = 'Name must be 11 characters or fewer'
    const ageNum = parseInt(age, 10)
    if (!age || isNaN(ageNum) || ageNum <= 0 || ageNum > 150) errs.age = 'Enter a valid age'
    if (!gender) errs.gender = 'Gender is required'
    if (inpatientNo && !/^\d{1,9}$/.test(inpatientNo)) errs.inpatientNo = 'Up to 9 digits only'
    if (selected.size === 0 && !additionalTests.trim()) errs.tests = 'Select at least one test or enter additional tests'
    if (Object.keys(errs).length) { setErrors(errs); return }

    onAdd(
      trimmedName,
      ageNum,
      gender as 'Male' | 'Female',
      inpatientNo,
      vacutainerLabel,
      Array.from(selected),
      additionalTests.trim()
    )
    setName('')
    setAge('')
    setGender('')
    setInpatientNo('')
    setVacutainerLabel(false)
    setSelected(new Set())
    setAdditionalTests('')
    setErrors({})
  }

  const basePages  = selected.size + (additionalTests.trim() ? 1 : 0)
  const pageCount  = vacutainerLabel ? basePages * 2 : basePages

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon} aria-hidden="true">👤</span>
        <h2 className={styles.cardTitle}>Add Patient</h2>
      </div>

      {/* Name */}
      <div className={styles.nameField}>
        <label htmlFor="patient-name" className={styles.label}>
          Name <span className={styles.required}>*</span>
          <span className={styles.charHint}>(max 11 characters)</span>
        </label>
        <input
          id="patient-name"
          type="text"
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          placeholder="e.g. RAHULMEHTA"
          value={name}
          maxLength={11}
          onChange={(e) => { setName(e.target.value.toUpperCase()); setErrors((er) => ({ ...er, name: undefined })) }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          aria-invalid={!!errors.name}
          disabled={disabled}
          autoComplete="off"
        />
        {errors.name && <span className={styles.errorMsg} role="alert">{errors.name}</span>}
      </div>

      {/* Age + Gender + Inpatient No. */}
      <div className={styles.triRow}>
        <div className={styles.subField}>
          <label htmlFor="patient-age" className={styles.label}>
            Age <span className={styles.required}>*</span>
          </label>
          <input
            id="patient-age"
            type="number"
            className={`${styles.input} ${errors.age ? styles.inputError : ''}`}
            placeholder="56"
            value={age}
            min={1}
            max={150}
            onChange={(e) => { setAge(e.target.value); setErrors((er) => ({ ...er, age: undefined })) }}
            disabled={disabled}
            autoComplete="off"
          />
          {errors.age && <span className={styles.errorMsg} role="alert">{errors.age}</span>}
        </div>

        <div className={styles.subField}>
          <label htmlFor="patient-gender" className={styles.label}>
            Gender <span className={styles.required}>*</span>
          </label>
          <select
            id="patient-gender"
            className={`${styles.select} ${errors.gender ? styles.inputError : ''}`}
            value={gender}
            onChange={(e) => { setGender(e.target.value as 'Male' | 'Female' | ''); setErrors((er) => ({ ...er, gender: undefined })) }}
            disabled={disabled}
          >
            <option value="">Select…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <span className={styles.errorMsg} role="alert">{errors.gender}</span>}
        </div>

        <div className={styles.subField}>
          <label htmlFor="patient-ipno" className={styles.label}>
            Inpatient No.
          </label>
          <input
            id="patient-ipno"
            type="text"
            inputMode="numeric"
            className={`${styles.input} ${errors.inpatientNo ? styles.inputError : ''}`}
            placeholder="12345"
            value={inpatientNo}
            maxLength={9}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 9)
              setInpatientNo(val)
              setErrors((er) => ({ ...er, inpatientNo: undefined }))
            }}
            disabled={disabled}
            autoComplete="off"
          />
          {errors.inpatientNo && <span className={styles.errorMsg} role="alert">{errors.inpatientNo}</span>}
        </div>
      </div>

      {/* Tests */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          <span>Essential Tests</span>
          <div className={styles.selectors}>
            <button type="button" className={styles.selectBtn} onClick={selectAll} disabled={disabled}>All</button>
            <button type="button" className={styles.selectBtn} onClick={clearAll} disabled={disabled}>None</button>
          </div>
        </legend>

        {errors.tests && <span className={styles.errorMsg} role="alert">{errors.tests}</span>}

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

      {/* Vacutainer Label */}
      <label className={styles.vacutainerLabel}>
        <input
          type="checkbox"
          className={styles.checkInput}
          checked={vacutainerLabel}
          onChange={(e) => setVacutainerLabel(e.target.checked)}
          disabled={disabled}
        />
        <span className={styles.vacutainerBox} aria-hidden="true">
          {vacutainerLabel && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
        <span className={styles.vacutainerText}>
          Vacutainer Label
          <span className={styles.vacutainerHint}> — prints each test page twice consecutively</span>
        </span>
      </label>

      {/* Additional Tests */}
      <div className={styles.additionalField}>
        <label htmlFor="additional-tests" className={styles.label}>
          Additional Tests
          <span className={styles.optionalHint}>(optional — printed on a separate page)</span>
        </label>
        <textarea
          id="additional-tests"
          className={styles.textarea}
          placeholder="e.g. Blood Culture, Urine C&S, D-Dimer"
          value={additionalTests}
          onChange={(e) => { setAdditionalTests(e.target.value); setErrors((er) => ({ ...er, tests: undefined })) }}
          disabled={disabled}
          rows={2}
        />
      </div>

      <button
        type="button"
        className={styles.addBtn}
        onClick={handleAdd}
        disabled={disabled}
        aria-label={`Add patient ${name || ''} to queue`}
      >
        <span>+ Add to Queue</span>
        {pageCount > 0 && (
          <span className={styles.countPill}>{pageCount} page{pageCount > 1 ? 's' : ''}</span>
        )}
      </button>
    </div>
  )
}
