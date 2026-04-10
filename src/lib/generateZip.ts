import type { PatientEntry, SessionData } from '@/types'
import { TEST_MAP } from '@/constants/tests'
import { generateLabPdf, toFilename } from './generatePdf'

export interface ZipResult {
  blob: Blob
  fileCount: number
}

/**
 * Generates a ZIP containing one PDF per (patient × test) combination.
 * JSZip and jsPDF are dynamically imported — only loaded on demand.
 */
export async function generateZip(
  session: SessionData,
  patients: PatientEntry[]
): Promise<ZipResult> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()

  let fileCount = 0

  for (const patient of patients) {
    for (const testId of patient.tests) {
      const pdfBytes = await generateLabPdf({
        date: session.date,
        doctor: session.doctor,
        patientName: patient.name,
        testId,
      })

      const test = TEST_MAP[testId]
      const filename = toFilename(patient.name, test.shortLabel)
      zip.file(filename, pdfBytes)
      fileCount++
    }
  }

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  return { blob, fileCount }
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
