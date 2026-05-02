import styles from './DownloadButton.module.css'

interface Props {
  totalPages: number
  disabled: boolean
  state: 'idle' | 'generating' | 'done' | 'error'
  error: string | null
  onClick: () => void
}

export function DownloadButton({ totalPages, disabled, state, error, onClick }: Props) {
  const label = {
    idle: `Download PDF  (${totalPages} page${totalPages !== 1 ? 's' : ''})`,
    generating: 'Generating PDF…',
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
        All tests in a single PDF — one page per test per patient
      </p>
    </div>
  )
}
