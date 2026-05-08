import type { PatientEntry } from '@/types'
import { TEST_MAP } from '@/constants/tests'
import styles from './PatientQueue.module.css'

interface Props {
  patients: PatientEntry[]
  onRemove: (id: string) => void
  totalPages: number
}

export function PatientQueue({ patients, onRemove, totalPages }: Props) {
  if (patients.length === 0) {
    return (
      <div className={styles.empty} role="status" aria-label="Patient queue empty">
        <span className={styles.emptyIcon} aria-hidden="true">📭</span>
        <p className={styles.emptyText}>No patients added yet</p>
        <p className={styles.emptyHint}>Add a patient above to see them here</p>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Patient Queue
          <span className={styles.countBadge} aria-label={`${patients.length} patients`}>
            {patients.length}
          </span>
        </h3>
        <span className={styles.pdfCount} aria-live="polite">
          {totalPages} page{totalPages !== 1 ? 's' : ''} will be generated
        </span>
      </div>

      <ul className={styles.list} role="list" aria-label="Patient queue">
        {patients.map((patient, idx) => (
          <li key={patient.id} className={styles.item} style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className={styles.itemLeft}>
              <span className={styles.avatar} aria-hidden="true">
                {patient.name.charAt(0).toUpperCase()}
              </span>
              <div className={styles.itemInfo}>
                <div className={styles.nameRow}>
                  <span className={styles.patientName}>{patient.name}</span>
                  <span className={styles.patientMeta}>
                    {patient.age}y · {patient.gender}
                    {patient.inpatientNo && ` · IP#${patient.inpatientNo}`}
                  </span>
                </div>
                <div className={styles.testTags} role="list" aria-label={`Tests for ${patient.name}`}>
                  {patient.tests.map((testId: string) => (
                    <span key={testId} className={styles.tag} role="listitem">
                      {TEST_MAP.get(testId as never)?.shortLabel ?? testId}
                    </span>
                  ))}
                  {patient.additionalTests.length > 0 && (
                    <span className={styles.tagExtra} role="listitem" title={patient.additionalTests.join(', ')}>
                      +{patient.additionalTests.length} test{patient.additionalTests.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {patient.vacutainerLabel && (
                    <span className={styles.tagVac} role="listitem">
                      ×2 vacutainer
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => onRemove(patient.id)}
              aria-label={`Remove ${patient.name} from queue`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
