import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePatientQueue } from '@/hooks/usePatientQueue'

describe('usePatientQueue', () => {
  it('starts with empty queue', () => {
    const { result } = renderHook(() => usePatientQueue())
    expect(result.current.patients).toHaveLength(0)
    expect(result.current.totalPdfs).toBe(0)
  })

  it('adds a patient', () => {
    const { result } = renderHook(() => usePatientQueue())
    act(() => { result.current.addPatient('Rahul', ['CBC', 'LFT']) })
    expect(result.current.patients).toHaveLength(1)
    expect(result.current.patients[0].name).toBe('Rahul')
    expect(result.current.patients[0].tests).toEqual(['CBC', 'LFT'])
  })

  it('calculates totalPdfs correctly', () => {
    const { result } = renderHook(() => usePatientQueue())
    act(() => { result.current.addPatient('Rahul', ['CBC', 'LFT', 'TFT']) })
    act(() => { result.current.addPatient('Priya', ['RBS']) })
    expect(result.current.totalPdfs).toBe(4)
  })

  it('removes a patient by id', () => {
    const { result } = renderHook(() => usePatientQueue())
    act(() => { result.current.addPatient('Rahul', ['CBC']) })
    const id = result.current.patients[0].id
    act(() => { result.current.removePatient(id) })
    expect(result.current.patients).toHaveLength(0)
  })

  it('clears all patients', () => {
    const { result } = renderHook(() => usePatientQueue())
    act(() => { result.current.addPatient('A', ['CBC']) })
    act(() => { result.current.addPatient('B', ['LFT']) })
    act(() => { result.current.clearAll() })
    expect(result.current.patients).toHaveLength(0)
  })

  it('trims whitespace from patient name', () => {
    const { result } = renderHook(() => usePatientQueue())
    act(() => { result.current.addPatient('  Rahul  ', ['CBC']) })
    expect(result.current.patients[0].name).toBe('Rahul')
  })
})
