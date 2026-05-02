import { useState, useCallback } from 'react'
import type { PatientEntry, SessionData } from '@/types'
import { generatePdfDownload, downloadBlob } from '@/lib/generateZip'

type DownloadState = 'idle' | 'generating' | 'done' | 'error'

export function useDownload() {
  const [state, setState] = useState<DownloadState>('idle')
  const [error, setError] = useState<string | null>(null)

  const download = useCallback(async (session: SessionData, patients: PatientEntry[]) => {
    setState('generating')
    setError(null)
    try {
      const { blob, pageCount } = await generatePdfDownload(session, patients)
      const dateStr = session.date || new Date().toISOString().slice(0, 10)
      downloadBlob(blob, `lab_reports_${dateStr}.pdf`)
      setState('done')
      setTimeout(() => setState('idle'), 3000)
      return pageCount
    } catch (err) {
      console.error('PDF generation failed:', err)
      setError('Failed to generate PDF. Please try again.')
      setState('error')
      setTimeout(() => setState('idle'), 4000)
      return 0
    }
  }, [])

  return { state, error, download }
}
