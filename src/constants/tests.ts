import type { TestDefinition, TestId } from '@/types'

export const TESTS: TestDefinition[] = [
  { id: 'CBC',           label: 'CBC — Complete Blood Count',                              shortLabel: 'CBC' },
  { id: 'RFT_SE',        label: 'RFT with SE — Renal Function Test with Serum Electrolytes', shortLabel: 'RFT with SE' },
  { id: 'RBS',           label: 'RBS — Random Blood Sugar',                                shortLabel: 'RBS' },
  { id: 'DETAILED_LFT',  label: 'LFT with Ca²⁺, Mg²⁺, PO₄³⁻',                            shortLabel: 'LFT w/ Ca,Mg,PO4' },
  { id: 'TFT',           label: 'TFT — Thyroid Function Test (FT3, FT4, TSH)',             shortLabel: 'TFT' },
  { id: 'ESR',           label: 'ESR — Erythrocyte Sedimentation Rate',                   shortLabel: 'ESR' },
  { id: 'S_ELECTROLYTES',label: 'S. Electrolytes — Serum Electrolytes',                   shortLabel: 'S. Electrolytes' },
  { id: 'LFT',           label: 'LFT — Liver Function Test',                               shortLabel: 'LFT' },
  { id: 'CA_MG_PO4',     label: 'Ca²⁺, Mg²⁺, PO₄³⁻',                                    shortLabel: 'Ca/Mg/PO4' },
  { id: 'SERUM_AMMONIA', label: 'Serum Ammonia',                                           shortLabel: 'Serum Ammonia' },
  { id: 'LIPID_PROFILE', label: 'Lipid Profile',                                           shortLabel: 'Lipid Profile' },
  { id: 'HBA1C',         label: 'HbA1c — Glycated Haemoglobin',                           shortLabel: 'HbA1c' },
  { id: 'PT_INR',        label: 'PT INR — Prothrombin Time / INR',                        shortLabel: 'PT INR' },
  { id: 'ABG',           label: 'ABG — Arterial Blood Gas',                                shortLabel: 'ABG' },
]

export const TEST_MAP: Map<TestId, TestDefinition> = new Map(TESTS.map((t) => [t.id, t]))
