import type { PatientEntry, SessionData } from '@/types'
import { generateLabPdf } from './generatePdf'

export interface DownloadResult {
  blob: Blob
  pageCount: number
}

/**
 * Generates a single multi-page PDF for all patients and their tests.
 * Returns a Blob (application/pdf) and the total page count.
 */
export async function generatePdfDownload(
  session: SessionData,
  patients: PatientEntry[]
): Promise<DownloadResult> {
  const pdfBytes = await generateLabPdf(session, patients)
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const pageCount = patients.reduce((sum, p) => {
    const base = p.tests.length + (p.additionalTests.trim() ? 1 : 0)
    return sum + (p.vacutainerLabel ? base * 2 : base)
  }, 0)
  return { blob, pageCount }
}

/** Triggers a browser file download for a Blob */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
