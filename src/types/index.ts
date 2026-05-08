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
  | 'HBSAG_HCV'
  | 'HIV'

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
  tomorrowTests: TestId[]          // subset of tests scheduled for session date + 1
  additionalTests: string[]
  additionalTestsTomorrow: boolean[]
}
