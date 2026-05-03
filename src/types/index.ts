export type TestId =
  | 'CBC'
  | 'ESR'
  | 'RFT_SE'
  | 'S_ELECTROLYTES'
  | 'DETAILED_LFT'
  | 'LFT'
  | 'CA_MG_PO4'
  | 'TFT'
  | 'RBS'
  | 'SERUM_AMMONIA'
  | 'LIPID_PROFILE'
  | 'HBA1C'
  | 'PT_INR'
  | 'ABG'

export interface TestDefinition {
  id: TestId
  label: string
  shortLabel: string
}

export interface SessionData {
  date: string
  unit: string
  ward: string
}

export interface PatientEntry {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female'
  inpatientNo: string
  vacutainerLabel: boolean
  tests: TestId[]
  additionalTests: string
}
