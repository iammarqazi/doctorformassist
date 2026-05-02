import type { PatientEntry, SessionData } from '@/types'
import { TEST_MAP } from '@/constants/tests'

// Exact dimensions from CBC5.docx (twips → mm: 2835 twips = 50mm, 851 twips = 15mm)
const PAGE_W = 50
const PAGE_H = 15

// Column layout matching DOCX 2-col structure (57 twip margins, 113 twip gap)
// Left col: starts at 1mm | Right col: starts at 1 + 23 + 2 = 26mm
const LEFT_X = 1
const RIGHT_X = 26

// Baseline Y positions for 3 rows of 10pt text on a 15mm page
// Top margin: 43 twips ≈ 0.76mm; cap height at 10pt ≈ 2.5mm; line height ≈ 4.2mm
const Y1 = 3.5   // row 1: date | [blank]
const Y2 = 7.5   // row 2: patient name | ward/unit
const Y3 = 11.5  // row 3: test acronym | age/gender

const MAX_COL_W = 22  // mm — max width per column before auto-sizing kicks in
const BASE_FONT = 10  // pt — matches DOCX sz val="20" (20 half-points = 10pt)
const MIN_FONT = 6    // pt — minimum for long additional-test strings

const formatDate = (d: string) => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}-${m}-${y}`
}

/**
 * Generates a single multi-page PDF (one page per patient × test combination).
 * Page size 50mm × 15mm matches CBC5.docx exactly — 2 columns, 3 rows, 10pt bold.
 * Patients appear in order; additional-tests text (if any) gets one extra page per patient.
 */
export async function generateLabPdf(session: SessionData, patients: PatientEntry[]): Promise<ArrayBuffer> {
  const { default: jsPDF } = await import('jspdf')

  const doc = new jsPDF({ unit: 'mm', format: [PAGE_W, PAGE_H] })
  let firstPage = true

  const fitAndDraw = (text: string, x: number, y: number, maxW: number) => {
    let fs = BASE_FONT
    doc.setFontSize(fs)
    while (fs > MIN_FONT && doc.getTextWidth(text) > maxW) {
      fs -= 0.5
      doc.setFontSize(fs)
    }
    doc.text(text, x, y)
    doc.setFontSize(BASE_FONT)
  }

  const drawSlip = (
    col1row1: string,  // date
    col1row2: string,  // patient name
    col1row3: string,  // test acronym or additional-tests text
    col2row2: string,  // ward/unit
    col2row3: string,  // age/gender
  ) => {
    if (!firstPage) doc.addPage([PAGE_W, PAGE_H])
    firstPage = false

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(BASE_FONT)

    // Row 1 — date only (right col blank, like the DOCX template)
    doc.text(col1row1, LEFT_X, Y1)

    // Row 2 — name | ward/unit
    doc.text(col1row2, LEFT_X, Y2)
    doc.text(col2row2, RIGHT_X, Y2)

    // Row 3 — test (auto-sized) | age/gender
    fitAndDraw(col1row3, LEFT_X, Y3, MAX_COL_W)
    doc.text(col2row3, RIGHT_X, Y3)
  }

  const dateStr = formatDate(session.date)
  const wardUnit = `Ward ${session.ward}/ ${session.unit}`

  for (const patient of patients) {
    const agGender = `${patient.age}/ ${patient.gender.toUpperCase()}`
    const patName = patient.name.toUpperCase()

    for (const testId of patient.tests) {
      const testDef = TEST_MAP.get(testId)
      const testLabel = testDef?.shortLabel ?? testId
      drawSlip(dateStr, patName, testLabel, wardUnit, agGender)
    }

    // Additional manual tests → one extra page per patient
    if (patient.additionalTests.trim()) {
      drawSlip(dateStr, patName, patient.additionalTests.trim(), wardUnit, agGender)
    }
  }

  return doc.output('arraybuffer') as ArrayBuffer
}
