import { useState, useCallback } from 'react'
import type { PatientEntry, TestId } from '@/types'

let idCounter = 0
const nextId = () => `patient-${++idCounter}-${Date.now()}`

export function usePatientQueue() {
  const [patients, setPatients] = useState<PatientEntry[]>([])

  const addPatient = useCallback((name: string, tests: TestId[]) => {
    setPatients((prev) => [...prev, { id: nextId(), name: name.trim(), tests }])
  }, [])

  const removePatient = useCallback((id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clearAll = useCallback(() => setPatients([]), [])

  const totalPdfs = patients.reduce((sum, p) => sum + p.tests.length, 0)

  return { patients, addPatient, removePatient, clearAll, totalPdfs }
}
