import type { PatientEntry, SessionData } from '@/types'
import { TEST_MAP } from '@/constants/tests'

// Exact dimensions from CBC5.docx: 2835 twips × 851 twips = 50mm × 15mm landscape strip
const PAGE_W = 50
const PAGE_H = 15

// 2-column layout (57 twip margins = 1mm, 113 twip gap = 2mm)
const LEFT_X  = 1
const RIGHT_X = 26

// Baseline Y for each row on a 15mm-tall page
const Y1 = 3.5
const Y2 = 7.7
const Y3 = 11.9

const BASE_FONT = 10
const MIN_FONT  = 6
const MAX_COL_W = 23  // mm per column

const formatDate = (d: string) => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}-${m}-${y}`
}

const addOneDay = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Generates a single multi-page PDF.
 * Every page is 50mm × 15mm landscape — 2 columns, 3 rows, 10pt Helvetica.
 * Per-test date: tests in patient.tomorrowTests use session date + 1.
 * Vacutainer label: each page printed twice consecutively when enabled.
 */
export async function generateLabPdf(session: SessionData, patients: PatientEntry[]): Promise<ArrayBuffer> {
  const { default: jsPDF } = await import('jspdf')

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
    col1row1: string,   // date
    col1row2: string,   // patient name
    col1row3: string,   // test acronym or additional-tests text
    col2row1: string,   // inpatient no.
    col2row2: string,   // ward/unit
    col2row3: string,   // age/gender
  ) => {
    if (!firstPage) doc.addPage([PAGE_W, PAGE_H], 'landscape')
    firstPage = false

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(BASE_FONT)

    doc.text(col1row1, LEFT_X, Y1)
    if (col2row1) doc.text(col2row1, RIGHT_X, Y1)

    doc.text(col1row2, LEFT_X, Y2)
    doc.text(col2row2, RIGHT_X, Y2)

    fitAndDraw(col1row3, LEFT_X, Y3, MAX_COL_W)
    doc.text(col2row3, RIGHT_X, Y3)
  }

  const todayDateStr    = formatDate(session.date)
  const tomorrowDateStr = formatDate(addOneDay(session.date))
  const wardUnit        = `Ward ${session.ward}/ ${session.unit}`

  for (const patient of patients) {
    const agGender  = `${patient.age}/ ${patient.gender.toUpperCase()}`
    const patName   = patient.name.toUpperCase()
    const ipNo      = patient.inpatientNo ?? ''
    const duplicate = patient.vacutainerLabel
    const tmrwSet   = new Set(patient.tomorrowTests)

    for (const testId of patient.tests) {
      const testLabel = TEST_MAP.get(testId)?.shortLabel ?? testId
      const dateStr   = tmrwSet.has(testId) ? tomorrowDateStr : todayDateStr
      drawSlip(dateStr, patName, testLabel, ipNo, wardUnit, agGender)
      if (duplicate) drawSlip(dateStr, patName, testLabel, ipNo, wardUnit, agGender)
    }

    for (let idx = 0; idx < patient.additionalTests.length; idx++) {
      const testLabel = patient.additionalTests[idx]
      const dateStr   = patient.additionalTestsTomorrow[idx] ? tomorrowDateStr : todayDateStr
      drawSlip(dateStr, patName, testLabel, ipNo, wardUnit, agGender)
      if (duplicate) drawSlip(dateStr, patName, testLabel, ipNo, wardUnit, agGender)
    }
  }

  return doc.output('arraybuffer') as ArrayBuffer
}
