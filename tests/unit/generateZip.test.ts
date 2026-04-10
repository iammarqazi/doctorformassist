import { describe, it, expect, vi } from 'vitest'
import { downloadBlob } from '@/lib/generateZip'

// Mock heavy deps
vi.mock('jszip', () => {
  const mockZip = {
    file: vi.fn(),
    generateAsync: vi.fn().mockResolvedValue(new Blob(['mock'], { type: 'application/zip' })),
  }
  return { default: vi.fn(() => mockZip) }
})

vi.mock('@/lib/generatePdf', () => ({
  generateLabPdf: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  toFilename: vi.fn().mockReturnValue('Patient_CBC.pdf'),
}))

describe('generateZip', () => {
  it('returns a blob and correct file count', async () => {
    const { generateZip } = await import('@/lib/generateZip')
    const result = await generateZip(
      { date: '2025-04-12', doctor: 'Sharma' },
      [
        { id: 'p1', name: 'Rahul', tests: ['CBC', 'LFT'] },
        { id: 'p2', name: 'Priya', tests: ['TFT'] },
      ]
    )
    expect(result.blob).toBeInstanceOf(Blob)
    expect(result.fileCount).toBe(3)
  })

  it('returns zero files for empty patient list', async () => {
    const { generateZip } = await import('@/lib/generateZip')
    const result = await generateZip({ date: '2025-04-12', doctor: 'Sharma' }, [])
    expect(result.fileCount).toBe(0)
  })
})

describe('downloadBlob', () => {
  it('creates and clicks an anchor element', () => {
    const anchor = {
      click: vi.fn(),
      href: '',
      download: '',
    } as unknown as HTMLAnchorElement

    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor)
    vi.spyOn(document.body, 'appendChild').mockImplementationOnce(() => anchor)
    vi.spyOn(document.body, 'removeChild').mockImplementationOnce(() => anchor)
    vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:mock')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementationOnce(() => undefined)

    downloadBlob(new Blob(['test']), 'test.zip')

    expect(anchor.click).toHaveBeenCalledOnce()
    expect(anchor.download).toBe('test.zip')
  })
})
