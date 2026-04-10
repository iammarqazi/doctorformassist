import { describe, it, expect, vi } from 'vitest'
import { toFilename } from '@/lib/generatePdf'

// Mock jsPDF — it relies on browser canvas APIs not available in jsdom
vi.mock('jspdf', () => {
  const mockDoc = {
    setFillColor: vi.fn(),
    setTextColor: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    rect: vi.fn(),
    roundedRect: vi.fn(),
    line: vi.fn(),
    text: vi.fn(),
    output: vi.fn().mockReturnValue(new ArrayBuffer(8)),
  }
  return { default: vi.fn(() => mockDoc) }
})

describe('toFilename', () => {
  it('creates safe filename from patient name and test label', () => {
    expect(toFilename('Rahul Mehta', 'CBC')).toBe('Rahul_Mehta_CBC.pdf')
  })

  it('replaces special characters with underscores', () => {
    expect(toFilename('Dr. A/B', 'PT INR')).toBe('Dr__A_B_PT_INR.pdf')
  })

  it('collapses multiple underscores', () => {
    expect(toFilename('Test  Patient', 'LFT')).toBe('Test__Patient_LFT.pdf')
  })

  it('handles single word name', () => {
    expect(toFilename('Priya', 'HbA1c')).toBe('Priya_HbA1c.pdf')
  })
})

describe('generateLabPdf', () => {
  it('returns a Uint8Array-like buffer', async () => {
    const { generateLabPdf } = await import('@/lib/generatePdf')
    const result = await generateLabPdf({
      date: '2025-04-12',
      doctor: 'Sharma',
      patientName: 'Rahul Mehta',
      testId: 'CBC',
    })
    expect(result).toBeDefined()
  })
})
