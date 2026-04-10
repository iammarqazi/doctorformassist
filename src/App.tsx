import { useState } from 'react'
import { SessionForm } from '@/components/SessionForm'
import { PatientForm } from '@/components/PatientForm'
import { PatientQueue } from '@/components/PatientQueue'
import { DownloadButton } from '@/components/DownloadButton'
import { usePatientQueue } from '@/hooks/usePatientQueue'
import { useDownload } from '@/hooks/useDownload'
import type { SessionData } from '@/types'
import styles from './App.module.css'

export default function App() {
  const [session, setSession] = useState<SessionData>({ date: '', doctor: '' })
  const { patients, addPatient, removePatient, clearAll, totalPdfs } = usePatientQueue()
  const { state: dlState, error: dlError, download } = useDownload()

  const sessionValid = session.date.trim() !== '' && session.doctor.trim() !== ''
  const canDownload = sessionValid && patients.length > 0

  const handleDownload = () => {
    if (!canDownload) return
    download(session, patients)
  }

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark} aria-hidden="true">✚</span>
            <span className={styles.logoText}>DoctorFormAssist</span>
          </div>
          <nav className={styles.headerRight}>
            <a
              href="https://www.doctorformassist.com"
              className={styles.domain}
              aria-label="DoctorFormAssist home"
            >
              www.doctorformassist.com
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Lab Requisition Generator</h1>
        <p className={styles.heroSub}>
          Set session details once · Add patients · Download all PDFs as a ZIP
        </p>
      </div>

      <main className={styles.main} id="main-content">
        {/* Step 1 — Session */}
        <section aria-labelledby="step1-label">
          <div className={styles.stepLabel} id="step1-label">
            <span className={styles.stepNum}>1</span>
            Set Session Details
          </div>
          <SessionForm value={session} onChange={setSession} />
          {!sessionValid && (
            <p className={styles.stepHint} role="status">
              Fill in date and doctor name to continue
            </p>
          )}
        </section>

        {/* Step 2 — Add Patients */}
        <section aria-labelledby="step2-label">
          <div className={styles.stepLabel} id="step2-label">
            <span className={styles.stepNum}>2</span>
            Add Patients &amp; Tests
          </div>
          <PatientForm onAdd={addPatient} disabled={!sessionValid} />
        </section>

        {/* Step 3 — Queue & Download */}
        <section aria-labelledby="step3-label">
          <div className={styles.stepLabelRow}>
            <div className={styles.stepLabel} id="step3-label">
              <span className={styles.stepNum}>3</span>
              Review &amp; Download
            </div>
            {patients.length > 0 && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={clearAll}
                aria-label="Clear all patients from queue"
              >
                Clear All
              </button>
            )}
          </div>

          <PatientQueue patients={patients} onRemove={removePatient} totalPdfs={totalPdfs} />

          <div className={styles.downloadWrap}>
            <DownloadButton
              totalPdfs={totalPdfs}
              disabled={!canDownload}
              state={dlState}
              error={dlError}
              onClick={handleDownload}
            />
            {!sessionValid && patients.length === 0 && (
              <p className={styles.downloadNote}>Complete steps 1 and 2 first</p>
            )}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          DoctorFormAssist &copy; {new Date().getFullYear()} &mdash; All PDF generation happens
          in your browser. No patient data is ever uploaded.
        </p>
        <p className={styles.footerSub}>
          Built for speed &amp; privacy &nbsp;·&nbsp; Free forever
        </p>
      </footer>
    </div>
  )
}
