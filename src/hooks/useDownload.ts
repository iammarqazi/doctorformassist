import { useState, useCallback } from 'react'
import type { PatientEntry, SessionData } from '@/types'
import { generateZip, downloadBlob } from '@/lib/generateZip'

type DownloadState = 'idle' | 'generating' | 'done' | 'error'

export function useDownload() {
  const [state, setState] = useState<DownloadState>('idle')
  const [error, setError] = useState<string | null>(null)

  const download = useCallback(async (session: SessionData, patients: PatientEntry[]) => {
    setState('generating')
    setError(null)
    try {
      const { blob, fileCount } = await generateZip(session, patients)
      const dateStr = session.date || new Date().toISOString().slice(0, 10)
      downloadBlob(blob, `lab_reports_${dateStr}.zip`)
      setState('done')
      setTimeout(() => setState('idle'), 3000)
      return fileCount
    } catch (err) {
      console.error('ZIP generation failed:', err)
      setError('Failed to generate files. Please try again.')
      setState('error')
      setTimeout(() => setState('idle'), 4000)
      return 0
    }
  }, [])

  return { state, error, download }
}
