export type ConfidenceTier = 'high' | 'moderate' | 'review-required';

export interface ClinicalDiagnosis {
  id: string;
  clinicalTerm: string;
  icd10Code: string;
  icd10Display: string;
  snomedCode: string;
  snomedDisplay: string;
  clinicalStatus: 'active' | 'resolved' | 'suspected';
  verificationStatus: 'confirmed' | 'provisional' | 'differential';
  confidence: number; // 0.0 to 1.0
  evidenceSpan: string;
  reasoningChain: string;
}

export interface DrugInteractionWarning {
  severity: 'high' | 'moderate';
  interactingAgent: string;
  clinicalMechanism: string;
  recommendation: string;
}

export interface ClinicalMedication {
  id: string;
  medicationName: string;
  rxnormCode: string;
  rxnormDisplay: string;
  dose: string;
  route: string;
  frequency: string;
  status: 'active' | 'hold' | 'discontinued' | 'prn';
  confidence: number;
  evidenceSpan: string;
  interactionWarning: DrugInteractionWarning | null;
}

export interface ClinicalLabVital {
  id: string;
  category: 'vital-sign' | 'laboratory';
  measurementName: string;
  loincCode: string;
  loincDisplay: string;
  value: number;
  unit: string;
  referenceRange: string;
  interpretation: 'normal' | 'high' | 'low' | 'critical-high' | 'critical-low';
  confidence: number;
  evidenceSpan: string;
  effectiveTime: string;
}

export interface ClinicalCodingAuditFlag {
  id: string;
  severity: 'high-impact-drg' | 'hcc-specificity' | 'clinical-validation' | 'medication-safety';
  ambiguousQuote: string;
  issueCategory: string;
  clinicalObservation: string;
  cdiQueryPrompt: string;
  potentialCodeUpgrade: string;
  financialOrQualityImpact: string;
  resolved?: boolean;
  resolutionAddendum?: string;
}

export interface PatientDemographics {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  age: number;
  sex: 'male' | 'female' | 'other' | 'unknown';
  encounterType: string;
  encounterClassCode: 'EMER' | 'AMB' | 'IMP' | 'VR';
  encounterDate: string;
  attendingClinician: string;
}

export interface ExtractionResult {
  patient: PatientDemographics;
  chainOfThoughtSummary: string[];
  diagnoses: ClinicalDiagnosis[];
  medications: ClinicalMedication[];
  labsAndVitals: ClinicalLabVital[];
  codingAuditFlags: ClinicalCodingAuditFlag[];
  extractionMode: 'precomputed-gold' | 'gemini-live' | 'deterministic-hybrid';
  latencyMs: number;
  schemaValid: boolean;
}

export interface ClinicalNotePreset {
  id: string;
  title: string;
  shortLabel: string;
  setting: string;
  chiefComplaint: string;
  rawNote: string;
  precomputedResult: ExtractionResult;
}

export interface FhirCoding {
  system: string;
  code: string;
  display: string;
}

export interface FhirResource {
  resourceType: string;
  id: string;
  meta?: {
    profile?: string[];
  };
  [key: string]: unknown;
}

export interface FhirBundleEntry {
  fullUrl: string;
  resource: FhirResource;
}

export interface FhirBundle {
  resourceType: 'Bundle';
  id: string;
  meta: {
    lastUpdated: string;
    profile: string[];
  };
  type: 'collection';
  timestamp: string;
  total: number;
  entry: FhirBundleEntry[];
}

export interface FhirValidationSummary {
  isValid: boolean;
  totalResources: number;
  resourceCounts: Record<string, number>;
  ontologyCounts: {
    icd10: number;
    snomed: number;
    rxnorm: number;
    loinc: number;
  };
  errors: string[];
}
