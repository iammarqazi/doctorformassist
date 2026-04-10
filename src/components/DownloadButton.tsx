import styles from './DownloadButton.module.css'

interface Props {
  totalPdfs: number
  disabled: boolean
  state: 'idle' | 'generating' | 'done' | 'error'
  error: string | null
  onClick: () => void
}

export function DownloadButton({ totalPdfs, disabled, state, error, onClick }: Props) {
  const label = {
    idle: `Download ZIP  (${totalPdfs} PDF${totalPdfs !== 1 ? 's' : ''})`,
    generating: 'Generating PDFs…',
    done: '✓ Downloaded!',
    error: 'Failed — try again',
  }[state]

  return (
    <div className={styles.wrap}>
      {error && (
        <p className={styles.error} role="alert">{error}</p>
      )}
      <button
        type="button"
        className={`${styles.btn} ${styles[state]}`}
        onClick={onClick}
        disabled={disabled || state === 'generating'}
        aria-live="polite"
        aria-label={label}
      >
        {state === 'generating' && <span className={styles.spinner} aria-hidden="true" />}
        {state === 'idle' && <span className={styles.icon} aria-hidden="true">⬇</span>}
        {label}
      </button>
      <p className={styles.hint}>
        All PDFs packed into a single ZIP file — one per patient per test
      </p>
    </div>
  )
}
