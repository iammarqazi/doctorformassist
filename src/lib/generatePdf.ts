import type { PatientEntry, SessionData } from '@/types'
import { TEST_MAP } from '@/constants/tests'

// Exact dimensions from CBC5.docx: 2835 twips × 851 twips = 50mm × 15mm landscape strip
const PAGE_W = 50   // mm — width (the long axis)
const PAGE_H = 15   // mm — height (the short axis)

// 2-column layout matching DOCX (57 twip left/right margins = 1mm, 113 twip gap = 2mm)
// Col 1: 1mm → ~24mm  |  Col 2: 26mm → ~49mm
const LEFT_X = 1
const RIGHT_X = 26

// Baseline Y for each of the 3 text rows on a 15mm-tall page
// Top margin ≈ 0.76mm; Helvetica 10pt cap-height ≈ 2.5mm; line spacing ≈ 4.2mm
const Y1 = 3.5
const Y2 = 7.7
const Y3 = 11.9

const BASE_FONT = 10   // pt — matches DOCX sz val="20" (20 half-points = 10pt)
const MIN_FONT  = 6    // pt — floor for long additional-test strings
const MAX_COL_W = 23   // mm — each column is ~23mm wide

const formatDate = (d: string) => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}-${m}-${y}`
}

/**
 * Generates a single multi-page PDF.
 * Every page is 50 mm × 15 mm landscape (matching CBC5.docx exactly).
 * Layout: 2 columns, 3 rows, 10pt regular Helvetica — no decorations.
 */
export async function generateLabPdf(session: SessionData, patients: PatientEntry[]): Promise<ArrayBuffer> {
  const { default: jsPDF } = await import('jspdf')

  // orientation:'landscape' ensures jsPDF treats [50, 15] as width=50, height=15
  // Without it, portrait mode swaps the dims to 15×50 (tall strip instead of wide strip).
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [PAGE_W, PAGE_H] })
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
    col1row3: string,  // test acronym or free-text additional tests
    col2row2: string,  // ward/unit
    col2row3: string,  // age/gender
  ) => {
    if (!firstPage) doc.addPage([PAGE_W, PAGE_H], 'landscape')
    firstPage = false

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(BASE_FONT)

    // Row 1 — date (left col only; right col blank per DOCX template)
    doc.text(col1row1, LEFT_X, Y1)

    // Row 2 — patient name | ward/unit
    doc.text(col1row2, LEFT_X, Y2)
    doc.text(col2row2, RIGHT_X, Y2)

    // Row 3 — test acronym (auto-sized) | age/gender
    fitAndDraw(col1row3, LEFT_X, Y3, MAX_COL_W)
    doc.text(col2row3, RIGHT_X, Y3)
  }

  const dateStr  = formatDate(session.date)
  const wardUnit = `Ward ${session.ward}/ ${session.unit}`

  for (const patient of patients) {
    const agGender = `${patient.age}/ ${patient.gender.toUpperCase()}`
    const patName  = patient.name.toUpperCase()

    for (const testId of patient.tests) {
      const testLabel = TEST_MAP.get(testId)?.shortLabel ?? testId
      drawSlip(dateStr, patName, testLabel, wardUnit, agGender)
    }

    // Additional manual tests → one extra page per patient
    if (patient.additionalTests.trim()) {
      drawSlip(dateStr, patName, patient.additionalTests.trim(), wardUnit, agGender)
    }
  }

  return doc.output('arraybuffer') as ArrayBuffer
}
