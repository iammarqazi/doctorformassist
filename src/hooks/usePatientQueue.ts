import { useState, useCallback } from 'react'
import type { PatientEntry, TestId } from '@/types'

let idCounter = 0
const nextId = () => `patient-${++idCounter}-${Date.now()}`

export function usePatientQueue() {
  const [patients, setPatients] = useState<PatientEntry[]>([])

  const addPatient = useCallback(
    (
      name: string,
      age: number,
      gender: 'Male' | 'Female',
      inpatientNo: string,
      vacutainerLabel: boolean,
      tests: TestId[],
      tomorrowTests: TestId[],
      additionalTests: string[],
      additionalTestsTomorrow: boolean[]
    ) => {
      setPatients((prev) => [
        ...prev,
        {
          id: nextId(),
          name: name.trim(),
          age,
          gender,
          inpatientNo,
          vacutainerLabel,
          tests,
          tomorrowTests,
          additionalTests,
          additionalTestsTomorrow,
        },
      ])
    },
    []
  )

  const removePatient = useCallback((id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clearAll = useCallback(() => setPatients([]), [])

  const totalPages = patients.reduce((sum, p) => {
    const base = p.tests.length + p.additionalTests.length
    return sum + (p.vacutainerLabel ? base * 2 : base)
  }, 0)

  return { patients, addPatient, removePatient, clearAll, totalPages }
}
