import { useState, useCallback } from 'react'
import type { PatientEntry, TestId } from '@/types'

let idCounter = 0
const nextId = () => `patient-${++idCounter}-${Date.now()}`

export function usePatientQueue() {
  const [patients, setPatients] = useState<PatientEntry[]>([])

  const addPatient = useCallback(
    (name: string, age: number, gender: 'Male' | 'Female', tests: TestId[], additionalTests: string) => {
      setPatients((prev) => [
        ...prev,
        { id: nextId(), name: name.trim(), age, gender, tests, additionalTests },
      ])
    },
    []
  )

  const removePatient = useCallback((id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clearAll = useCallback(() => setPatients([]), [])

  const totalPages = patients.reduce(
    (sum, p) => sum + p.tests.length + (p.additionalTests.trim() ? 1 : 0),
    0
  )

  return { patients, addPatient, removePatient, clearAll, totalPages }
}
