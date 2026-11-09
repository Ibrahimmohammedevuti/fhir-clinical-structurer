import { ClinicalNotePreset } from '../types/clinical';

export const CLINICAL_NOTE_PRESETS: ClinicalNotePreset[] = [
  {
    id: 'ed-hp',
    title: 'Emergency Dept H&P — Acute Decompensated HFrEF & Hyperkalemic AKI',
    shortLabel: '01. Emergency Dept H&P',
    setting: 'Emergency Medicine · Level 1 Trauma & Cardiac Center',
    chiefComplaint: 'Severe dyspnea at rest, orthopnea x3 days, bilateral lower extremity edema',
    rawNote: `EMERGENCY DEPARTMENT HISTORY & PHYSICAL
PATIENT: Vance, Arthur J. | MRN: 884-29-104 | DOB: 1958-03-14 (68yo M)
DATE/TIME: 2026-11-08 18:42 | ATTENDING: Dr. Ibrahim Mohammed, MD

CC: "Can't catch my breath lying flat since Thursday, legs swollen up to my knees."

HPI: 68yo M w/ PMH significant for ischemic cardiomyopathy / HFrEF (last TTE 04/2026 EF 25-30%), CAD s/p LAD DES (2022), CKD stage 3a (baseline Cr ~1.3-1.4 mg/dL), HTN, and chronic non-valvular AFib. Presents via EMS w/ 3-day history of progressive DOE now occurring at rest, 3-pillow orthopnea, PND, and 11-lb weight gain over 1 week. Admits running out of his PO Torsemide 5 days ago; also took OTC Ibuprofen 600mg TID x4 days for right knee osteoarthritis flare. Denies crushing substernal chest pain, fever, chills, dysuria, or productive cough. EMS noted SpO2 87% on room air, placed on 4L NC w/ improvement to 94%.

HOME MEDS RECONCILIATION:
- Lisinopril 20 mg PO daily (took this AM)
- Spironolactone 25 mg PO daily (took this AM)
- Carvedilol 12.5 mg PO BID
- Torsemide 20 mg PO daily (missed last 5 days)
- Apixaban 5 mg PO BID
- Ibuprofen 600 mg PO TID PRN (self-initiated x4 days - HOLD)

ED ORDERS / ADMINISTERED:
- Furosemide 80 mg IV push x1 now
- Calcium Gluconate 1000 mg IV over 10 min

OBJECTIVE / VITALS (18:45):
BP 168/102 mmHg | HR 112 bpm (irregularly irregular) | RR 26 /min | Temp 36.8 °C | SpO2 87% on RA -> 94% on 4L NC | Weight 96.4 kg

PHYSICAL EXAM:
Gen: Tripod posture, speaking in 4-5 word sentences, mild accessory muscle use.
CV: Irregularly irregular tachycardia, S3 gallop audible at apex, JVD elevated to 14 cm H2O.
Resp: Bibasilar rales 1/2 way up lung fields bilaterally, no wheezes.
Ext: 3+ pitting edema bilateral lower extremities to knees, warm.

LABS (19:10 RESULTED):
- NT-proBNP: 6,840 pg/mL (Ref < 300 pg/mL) [CRITICAL HIGH]
- Troponin I (High-Sensitivity): 64 ng/L (Ref < 20 ng/L) [HIGH]
- Serum Creatinine: 2.62 mg/dL (Baseline 1.35 mg/dL) [HIGH]
- eGFR (CKD-EPI): 24 mL/min/1.73m2 (Ref > 60) [LOW]
- Serum Potassium (K+): 5.9 mEq/L (Ref 3.5-5.1 mEq/L) [CRITICAL HIGH]
- Serum Sodium (Na+): 131 mEq/L (Ref 135-145 mEq/L) [LOW]
- Venous Lactate: 2.3 mmol/L (Ref 0.5-2.0 mmol/L) [HIGH]

ECG: AFib w/ RVR at 114 bpm, peaked T-waves in V2-V4, no ST-segment elevations.

ASSESSMENT & PLAN:
1. Acute heart failure exacerbation (wet/warm profile) triggered by diuretic non-adherence and NSAID nephrotoxicity. Give IV Lasix 80mg, monitor strict I&Os.
2. Elevated hs-Troponin 64 likely type 2 demand vs NSTEMI; trend serial troponins.
3. Renal insufficiency w/ Cr 2.62 (up from 1.35) and K+ 5.9 w/ peaked T-waves. Give IV Calcium Gluconate, insulin/D50, hold ACEi/Aldactone/NSAIDs.
4. Hypoxia on arrival (87% RA), currently stable on 4L NC. Admit to Telemetry / Step-Down.`,
    precomputedResult: {
      patient: {
        id: 'pat-88429104',
        name: 'Arthur J. Vance',
        mrn: '884-29-104',
        dob: '1958-03-14',
        age: 68,
        sex: 'male',
        encounterType: 'Emergency Department Admission — Telemetry Step-Down',
        encounterClassCode: 'EMER',
        encounterDate: '2026-11-08T18:42:00Z',
        attendingClinician: 'Dr. Ibrahim Mohammed, MD'
      },
      chainOfThoughtSummary: [
        'Expanded clinical shorthand: "HFrEF (EF 25-30%)" + "Acute heart failure exacerbation" -> Mapped to ICD-10-CM I50.23 (Acute on chronic systolic [congestive] heart failure) and SNOMED-CT 441481004.',
        'Filtered negated symptoms: "Denies crushing substernal chest pain, fever, chills, dysuria, or productive cough" -> Excluded infectious pneumonia or UTI from active diagnoses.',
        'Evaluated renal trajectory: Serum Cr rose from 1.35 mg/dL baseline to 2.62 mg/dL (stage 2 KDIGO AKI) following NSAID + ACEi + Spironolactone exposure -> Mapped to N17.9 (Acute kidney failure) superimposed on N18.31 (CKD Stage 3a).',
        'Flagged severe pharmacotherapy interactions: Concurrent Lisinopril 20mg + Spironolactone 25mg + Ibuprofen 600mg TID ("Triple Whammy" nephrotoxicity + life-threatening hyperkalemia K+ 5.9 mEq/L with peaked T-waves).',
        'Triggered 3 CDI Coding Audit flags: (1) Room air SpO2 87% with tachypnea (RR 26) and accessory muscle use requires clarification for Acute Hypoxic Respiratory Failure (J96.01 - MCC); (2) "Elevated hs-Troponin 64 likely type 2 demand vs NSTEMI" requires definitive coding query for I21.A1 vs I21.4; (3) "Renal insufficiency" under-codes KDIGO Stage 2 Acute Kidney Injury (N17.9).'
      ],
      diagnoses: [
        {
          id: 'dx-ed-1',
          clinicalTerm: 'Acute on chronic systolic (congestive) heart failure (HFrEF)',
          icd10Code: 'I50.23',
          icd10Display: 'Acute on chronic systolic (congestive) heart failure',
          snomedCode: '441481004',
          snomedDisplay: 'Acute on chronic systolic heart failure (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.99,
          evidenceSpan: '68yo M w/ PMH significant for ischemic cardiomyopathy / HFrEF (last TTE 04/2026 EF 25-30%) ... Acute heart failure exacerbation',
          reasoningChain: 'Explicit history of HFrEF (EF 25-30%) presenting with S3 gallop, JVD 14cm, NT-proBNP 6,840 pg/mL, and acute volume overload.'
        },
        {
          id: 'dx-ed-2',
          clinicalTerm: 'Acute kidney injury (AKI) superimposed on CKD stage 3a',
          icd10Code: 'N17.9',
          icd10Display: 'Acute kidney failure, unspecified',
          snomedCode: '14669001',
          snomedDisplay: 'Acute renal failure syndrome (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.97,
          evidenceSpan: 'Serum Creatinine: 2.62 mg/dL (Baseline 1.35 mg/dL) ... Renal insufficiency w/ Cr 2.62',
          reasoningChain: '1.94x rise in serum creatinine over baseline (1.35 -> 2.62 mg/dL) meets KDIGO Stage 2 AKI criteria secondary to cardiorenal syndrome and NSAID + RAAS blockade.'
        },
        {
          id: 'dx-ed-3',
          clinicalTerm: 'Hyperkalemia with electrocardiographic peaked T-waves',
          icd10Code: 'E87.5',
          icd10Display: 'Hyperkalemia',
          snomedCode: '14140009',
          snomedDisplay: 'Hyperkalemia (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.99,
          evidenceSpan: 'Serum Potassium (K+): 5.9 mEq/L ... peaked T-waves in V2-V4',
          reasoningChain: 'Critical potassium elevation (5.9 mEq/L) with myocardial membrane instability requiring emergent IV Calcium Gluconate.'
        },
        {
          id: 'dx-ed-4',
          clinicalTerm: 'Atrial fibrillation with rapid ventricular response (RVR)',
          icd10Code: 'I48.91',
          icd10Display: 'Unspecified atrial fibrillation',
          snomedCode: '314208002',
          snomedDisplay: 'Rapid atrial fibrillation (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.95,
          evidenceSpan: 'ECG: AFib w/ RVR at 114 bpm',
          reasoningChain: 'Documented chronic non-valvular atrial fibrillation presenting with irregularly irregular tachycardia at 112-114 bpm.'
        },
        {
          id: 'dx-ed-5',
          clinicalTerm: 'Type 2 myocardial infarction (demand ischemia) vs NSTEMI',
          icd10Code: 'I21.A1',
          icd10Display: 'Myocardial infarction type 2',
          snomedCode: '791000119109',
          snomedDisplay: 'Myocardial infarction type 2 (disorder)',
          clinicalStatus: 'suspected',
          verificationStatus: 'differential',
          confidence: 0.84,
          evidenceSpan: 'Elevated hs-Troponin 64 likely type 2 demand vs NSTEMI',
          reasoningChain: 'High-sensitivity Troponin I elevated at 64 ng/L without ST elevation or crushing chest pain in setting of tachyarrhythmia and acute heart failure strain.'
        }
      ],
      medications: [
        {
          id: 'med-ed-1',
          medicationName: 'Furosemide 80 mg IV Push',
          rxnormCode: '1719286',
          rxnormDisplay: 'furosemide 10 MG/ML Injectable Solution',
          dose: '80 mg',
          route: 'IV',
          frequency: 'Once (STAT)',
          status: 'active',
          confidence: 0.99,
          evidenceSpan: 'Furosemide 80 mg IV push x1 now',
          interactionWarning: null
        },
        {
          id: 'med-ed-2',
          medicationName: 'Lisinopril 20 mg Oral Tablet',
          rxnormCode: '314077',
          rxnormDisplay: 'lisinopril 20 MG Oral Tablet',
          dose: '20 mg',
          route: 'PO',
          frequency: 'Daily',
          status: 'hold',
          confidence: 0.98,
          evidenceSpan: 'Lisinopril 20 mg PO daily (took this AM) ... hold ACEi/Aldactone/NSAIDs',
          interactionWarning: {
            severity: 'high',
            interactingAgent: 'Spironolactone 25 mg + Ibuprofen 600 mg + AKI (K+ 5.9 mEq/L)',
            clinicalMechanism: 'Synergistic efferent arteriolar dilation + aldosterone blockade + afferent vasoconstriction precipitates acute renal failure and life-threatening hyperkalemia.',
            recommendation: 'HOLD Lisinopril immediately until AKI resolves (Cr returns toward baseline) and serum K+ < 5.0 mEq/L.'
          }
        },
        {
          id: 'med-ed-3',
          medicationName: 'Spironolactone 25 mg Oral Tablet',
          rxnormCode: '198211',
          rxnormDisplay: 'spironolactone 25 MG Oral Tablet',
          dose: '25 mg',
          route: 'PO',
          frequency: 'Daily',
          status: 'hold',
          confidence: 0.98,
          evidenceSpan: 'Spironolactone 25 mg PO daily (took this AM) ... hold ACEi/Aldactone/NSAIDs',
          interactionWarning: {
            severity: 'high',
            interactingAgent: 'Lisinopril 20 mg + Serum K+ 5.9 mEq/L (eGFR 24 mL/min)',
            clinicalMechanism: 'Mineralocorticoid receptor antagonism impairs distal tubular potassium excretion; contraindicated when K+ > 5.0 mEq/L or eGFR < 30 mL/min/1.73m².',
            recommendation: 'HOLD Spironolactone and administer IV Calcium Gluconate + intracellular K+ shift protocol.'
          }
        },
        {
          id: 'med-ed-4',
          medicationName: 'Ibuprofen 600 mg Oral Tablet',
          rxnormCode: '197806',
          rxnormDisplay: 'ibuprofen 600 MG Oral Tablet',
          dose: '600 mg',
          route: 'PO',
          frequency: 'TID PRN',
          status: 'discontinued',
          confidence: 0.97,
          evidenceSpan: 'Ibuprofen 600 mg PO TID PRN (self-initiated x4 days - HOLD)',
          interactionWarning: {
            severity: 'high',
            interactingAgent: 'Apixaban 5 mg BID + HFrEF + CKD Stage 3a',
            clinicalMechanism: 'Prostaglandin inhibition causes afferent renal vasoconstriction, sodium/water retention worsening HFrEF, and 2.5x increased major GI bleeding risk with Apixaban.',
            recommendation: 'Discontinue all systemic NSAIDs permanently in HFrEF and CKD + anticoagulation.'
          }
        },
        {
          id: 'med-ed-5',
          medicationName: 'Apixaban 5 mg Oral Tablet',
          rxnormCode: '1364430',
          rxnormDisplay: 'apixaban 5 MG Oral Tablet',
          dose: '5 mg',
          route: 'PO',
          frequency: 'BID',
          status: 'active',
          confidence: 0.96,
          evidenceSpan: 'Apixaban 5 mg PO BID',
          interactionWarning: {
            severity: 'moderate',
            interactingAgent: 'Acute Kidney Injury (Cr 2.62 mg/dL, eGFR 24 mL/min)',
            clinicalMechanism: 'Apixaban undergoes ~27% renal clearance; severe renal impairment increases systemic FXa inhibition exposure.',
            recommendation: 'Monitor hemoglobin and renal trajectory closely; evaluate dose adjustment criteria if Cr >= 1.5 mg/dL persists with age/weight thresholds.'
          }
        },
        {
          id: 'med-ed-6',
          medicationName: 'Calcium Gluconate 1000 mg IV',
          rxnormCode: '1807634',
          rxnormDisplay: 'calcium gluconate 100 MG/ML Injectable Solution',
          dose: '1000 mg',
          route: 'IV',
          frequency: 'Once over 10 min',
          status: 'active',
          confidence: 0.99,
          evidenceSpan: 'Calcium Gluconate 1000 mg IV over 10 min',
          interactionWarning: null
        }
      ],
      labsAndVitals: [
        {
          id: 'obs-ed-1',
          category: 'vital-sign',
          measurementName: 'Oxygen Saturation (Room Air Arrival)',
          loincCode: '59408-5',
          loincDisplay: 'Oxygen saturation in Arterial blood by Pulse oximetry',
          value: 87,
          unit: '%',
          referenceRange: '95 - 100 %',
          interpretation: 'critical-low',
          confidence: 0.99,
          evidenceSpan: 'SpO2 87% on RA -> 94% on 4L NC',
          effectiveTime: '2026-11-08T18:45:00Z'
        },
        {
          id: 'obs-ed-2',
          category: 'vital-sign',
          measurementName: 'Systolic Blood Pressure',
          loincCode: '8480-6',
          loincDisplay: 'Systolic blood pressure',
          value: 168,
          unit: 'mmHg',
          referenceRange: '90 - 120 mmHg',
          interpretation: 'high',
          confidence: 0.99,
          evidenceSpan: 'BP 168/102 mmHg',
          effectiveTime: '2026-11-08T18:45:00Z'
        },
        {
          id: 'obs-ed-3',
          category: 'vital-sign',
          measurementName: 'Heart Rate',
          loincCode: '8867-4',
          loincDisplay: 'Heart rate',
          value: 112,
          unit: '/min',
          referenceRange: '60 - 100 /min',
          interpretation: 'high',
          confidence: 0.99,
          evidenceSpan: 'HR 112 bpm (irregularly irregular)',
          effectiveTime: '2026-11-08T18:45:00Z'
        },
        {
          id: 'obs-ed-4',
          category: 'laboratory',
          measurementName: 'NT-proBNP',
          loincCode: '33762-6',
          loincDisplay: 'Natriuretic peptide.B prohormone N-Terminal [Mass/volume] in Serum or Plasma',
          value: 6840,
          unit: 'pg/mL',
          referenceRange: '< 300 pg/mL',
          interpretation: 'critical-high',
          confidence: 0.99,
          evidenceSpan: 'NT-proBNP: 6,840 pg/mL (Ref < 300 pg/mL)',
          effectiveTime: '2026-11-08T19:10:00Z'
        },
        {
          id: 'obs-ed-5',
          category: 'laboratory',
          measurementName: 'Serum Potassium (K+)',
          loincCode: '2823-3',
          loincDisplay: 'Potassium [Moles/volume] in Serum or Plasma',
          value: 5.9,
          unit: 'mEq/L',
          referenceRange: '3.5 - 5.1 mEq/L',
          interpretation: 'critical-high',
          confidence: 0.99,
          evidenceSpan: 'Serum Potassium (K+): 5.9 mEq/L (Ref 3.5-5.1 mEq/L)',
          effectiveTime: '2026-11-08T19:10:00Z'
        },
        {
          id: 'obs-ed-6',
          category: 'laboratory',
          measurementName: 'Serum Creatinine',
          loincCode: '2160-0',
          loincDisplay: 'Creatinine [Mass/volume] in Serum or Plasma',
          value: 2.62,
          unit: 'mg/dL',
          referenceRange: '0.70 - 1.30 mg/dL',
          interpretation: 'high',
          confidence: 0.99,
          evidenceSpan: 'Serum Creatinine: 2.62 mg/dL (Baseline 1.35 mg/dL)',
          effectiveTime: '2026-11-08T19:10:00Z'
        },
        {
          id: 'obs-ed-7',
          category: 'laboratory',
          measurementName: 'Troponin I (High-Sensitivity)',
          loincCode: '89579-7',
          loincDisplay: 'Troponin I.cardiac [Mass/volume] in Serum or Plasma by High sensitivity method',
          value: 64,
          unit: 'ng/L',
          referenceRange: '< 20 ng/L',
          interpretation: 'high',
          confidence: 0.98,
          evidenceSpan: 'Troponin I (High-Sensitivity): 64 ng/L (Ref < 20 ng/L)',
          effectiveTime: '2026-11-08T19:10:00Z'
        },
        {
          id: 'obs-ed-8',
          category: 'laboratory',
          measurementName: 'eGFR (CKD-EPI)',
          loincCode: '62238-1',
          loincDisplay: 'Glomerular filtration rate/1.73 sq M.predicted [Volume Rate/Area] in Serum, Plasma or Blood by Creatinine-based formula (CKD-EPI)',
          value: 24,
          unit: 'mL/min/1.73m2',
          referenceRange: '> 60 mL/min/1.73m2',
          interpretation: 'low',
          confidence: 0.98,
          evidenceSpan: 'eGFR (CKD-EPI): 24 mL/min/1.73m2 (Ref > 60)',
          effectiveTime: '2026-11-08T19:10:00Z'
        }
      ],
      codingAuditFlags: [
        {
          id: 'cdi-ed-1',
          severity: 'high-impact-drg',
          ambiguousQuote: 'Hypoxia on arrival (87% RA), currently stable on 4L NC.',
          issueCategory: 'Unconfirmed Acuity / MCC Capture Gap',
          clinicalObservation: 'Patient presented in tripod position speaking in 4-5 word sentences with RR 26/min, accessory muscle use, and room air SpO2 87% requiring 4L supplemental O2. Documenting "Hypoxia" alone maps to symptom code R09.02 rather than physiological respiratory failure.',
          cdiQueryPrompt: 'Based on arrival SpO2 of 87% on room air, tripod positioning, RR 26, and supplemental O2 requirement, please clarify if the patient has Acute Hypoxic Respiratory Failure secondary to Acute Decompensated Heart Failure.',
          potentialCodeUpgrade: 'R09.02 (Hypoxemia) → J96.01 (Acute respiratory failure with hypoxia)',
          financialOrQualityImpact: 'MS-DRG 292 → MS-DRG 291 (Heart Failure & Shock with MCC · Relative Weight +0.58)',
          resolved: false
        },
        {
          id: 'cdi-ed-2',
          severity: 'hcc-specificity',
          ambiguousQuote: 'Renal insufficiency w/ Cr 2.62 (up from 1.35)',
          issueCategory: 'Non-Specific Terminology ("Renal Insufficiency")',
          clinicalObservation: 'The phrase "renal insufficiency" codes to unspecified renal disease (N28.9) in ICD-10-CM, failing to capture KDIGO Stage 2 Acute Kidney Injury (Cr 1.94x baseline).',
          cdiQueryPrompt: 'Serum Creatinine increased from baseline 1.35 mg/dL to 2.62 mg/dL. Can you clarify whether "renal insufficiency" represents Acute Kidney Injury (AKI) superimposed on CKD Stage 3a?',
          potentialCodeUpgrade: 'N28.9 (Disorder of kidney, unspecified) → N17.9 (Acute kidney failure) + N18.31 (CKD Stage 3a)',
          financialOrQualityImpact: 'Captures CMS-HCC V28 Category 326 & Inpatient CC status',
          resolved: false
        },
        {
          id: 'cdi-ed-3',
          severity: 'clinical-validation',
          ambiguousQuote: 'Elevated hs-Troponin 64 likely type 2 demand vs NSTEMI',
          issueCategory: 'Differential Diagnosis Uncertainty',
          clinicalObservation: 'Outpatient/ED coding guidelines prohibit coding "rule out" or "vs" diagnoses as confirmed; inpatient admission requires clarification of Type 2 MI (demand ischemia) versus acute atherothrombotic NSTEMI.',
          cdiQueryPrompt: 'Following serial hs-Troponin trends, please specify whether the myocardial injury represents Type 2 Myocardial Infarction due to demand ischemia (AFib w/ RVR & ADHF), non-ischemic myocardial injury, or Type 1 NSTEMI.',
          potentialCodeUpgrade: 'R79.89 (Abnormal blood chemistry) → I21.A1 (Myocardial infarction type 2)',
          financialOrQualityImpact: 'Clarifies SOI/ROM tier and prevents erroneous AMI core measure penalty',
          resolved: false
        }
      ],
      extractionMode: 'precomputed-gold',
      latencyMs: 38,
      schemaValid: true
    }
  },
  {
    id: 'pcp-dm2',
    title: 'Primary Care Follow-up — Uncontrolled T2DM, Stage 3b CKD & Neuropathy',
    shortLabel: '02. Primary Care Diabetes',
    setting: 'Ambulatory Internal Medicine Clinic · Chronic Disease Management',
    chiefComplaint: '3-month diabetes follow-up, burning paresthesias in both feet, home glucose 210-260 mg/dL',
    rawNote: `AMBULATORY PROGRESS NOTE — INTERNAL MEDICINE
PATIENT: Chen, Evelyn M. | MRN: 409-81-772 | DOB: 1969-07-22 (57yo F)
DATE: 2026-11-08 10:15 | PROVIDER: Dr. Ibrahim Mohammed, MD

SUBJECTIVE:
57yo F returns for 3-month f/u of Type 2 Diabetes Mellitus (diagnosed 2015), essential HTN, hyperlipidemia, and chronic kidney disease. She reports fasting fingerstick glucoses running 210-265 mg/dL over the past month. Complains of worsening bilateral "pins and needles" and burning discomfort in her toes and soles at night (6/10 severity). Denies hypoglycemic episodes, chest pain, vision changes, or foot ulcers. She takes her medications daily as prescribed.

CURRENT MEDICATIONS:
1. Metformin HCl 1000 mg PO BID (2000 mg/day total)
2. Glipizide XL 10 mg PO daily
3. Semaglutide (Ozempic) 1 mg SC once weekly (initiated 4 weeks ago)
4. Lisinopril 40 mg PO daily
5. Atorvastatin 40 mg PO QHS
6. Gabapentin 300 mg PO QHS (for foot burning)

VITALS:
BP 146/88 mmHg | HR 78 bpm | BMI 32.8 kg/m2 | Weight 87.2 kg | Temp 36.6 °C

PHYSICAL EXAM:
Gen: Alert, NAD.
CV: RRR, no murmurs or edema.
Neuro/Foot Exam: Decreased sensation to 10-g Semmes-Weinstein monofilament at plantar aspect of 1st and 5th metatarsal heads B/L; diminished vibration sense at great toes; pedal pulses 2+ B/L, skin intact without ulceration.

LABORATORY RESULTS (Drawn 2026-11-06):
- Hemoglobin A1c (HbA1c): 9.4 % (Ref < 5.7%, Goal < 7.0%) [HIGH]
- Fasting Plasma Glucose: 238 mg/dL (Ref 70-99 mg/dL) [HIGH]
- Serum Creatinine: 1.68 mg/dL (Ref 0.55-1.02 mg/dL) [HIGH]
- eGFR (CKD-EPI): 36 mL/min/1.73m2 (Down from 44 mL/min 6 mos ago) [LOW]
- Urine Albumin-to-Creatinine Ratio (UACR): 342 mg/g (Ref < 30 mg/g) [HIGH]
- LDL Cholesterol: 74 mg/dL (Ref < 100 mg/dL) [NORMAL]
- Serum Potassium: 4.7 mEq/L (Ref 3.5-5.1 mEq/L) [NORMAL]

ASSESSMENT & PLAN:
1. Type 2 diabetes, uncontrolled (A1c 9.4%). Discussed diet and adherence.
2. CKD stage 3b (eGFR 36) with macroalbuminuria (UACR 342). Start Empagliflozin 10mg daily for nephroprotection.
3. Peripheral neuropathy in bilateral feet — increase Gabapentin to 300mg BID.
4. Benign hypertension, slightly above goal at 146/88. Continue Lisinopril 40mg.`,
    precomputedResult: {
      patient: {
        id: 'pat-40981772',
        name: 'Evelyn M. Chen',
        mrn: '409-81-772',
        dob: '1969-07-22',
        age: 57,
        sex: 'female',
        encounterType: 'Ambulatory Primary Care Follow-up',
        encounterClassCode: 'AMB',
        encounterDate: '2026-11-08T10:15:00Z',
        attendingClinician: 'Dr. Ibrahim Mohammed, MD'
      },
      chainOfThoughtSummary: [
        'Established ICD-10-CM causal combination codes: Documented T2DM + CKD Stage 3b + UACR 342 mg/g -> Mapped to E11.22 (Type 2 diabetes mellitus with diabetic chronic kidney disease) + N18.32 (CKD stage 3b).',
        'Linked neurological exam findings: Diminished 10-g monofilament sensation and burning paresthesias in T2DM patient -> Mapped to E11.42 (Type 2 diabetes mellitus with diabetic polyneuropathy).',
        'Detected critical renal dosing contraindiction: Metformin 1000 mg PO BID (2,000 mg/day) in a patient whose eGFR declined to 36 mL/min/1.73m² (Stage 3b CKD) exceeds FDA/KDIGO maximum of 1,000 mg/day for eGFR 30-44 mL/min.',
        'Detected sulfonylurea + GLP-1 RA interaction: Glipizide XL 10mg daily combined with Semaglutide 1mg SC weekly increases insulin secretagogue hypoglycemia risk.',
        'Flagged HCC Coding Audit gap: Note lists "Type 2 diabetes, uncontrolled", "CKD stage 3b", and "Peripheral neuropathy" as separate numbered items without explicit causal linkage phrasing in the Assessment.'
      ],
      diagnoses: [
        {
          id: 'dx-pcp-1',
          clinicalTerm: 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
          icd10Code: 'E11.22',
          icd10Display: 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
          snomedCode: '422099009',
          snomedDisplay: 'Chronic kidney disease stage 3 due to type 2 diabetes mellitus (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.98,
          evidenceSpan: 'Type 2 Diabetes Mellitus ... CKD stage 3b (eGFR 36) with macroalbuminuria (UACR 342)',
          reasoningChain: 'ICD-10-CM Section I.A.15 "With" guideline presumes causal linkage between Diabetes and CKD unless explicitly attributed to another etiology.'
        },
        {
          id: 'dx-pcp-2',
          clinicalTerm: 'Chronic kidney disease, stage 3b (moderate-to-severe)',
          icd10Code: 'N18.32',
          icd10Display: 'Chronic kidney disease, stage 3b',
          snomedCode: '700379002',
          snomedDisplay: 'Chronic kidney disease stage 3B (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.99,
          evidenceSpan: 'eGFR (CKD-EPI): 36 mL/min/1.73m2 ... CKD stage 3b (eGFR 36)',
          reasoningChain: 'eGFR between 30-44 mL/min/1.73m² persistently > 3 months confirms Stage 3b CKD.'
        },
        {
          id: 'dx-pcp-3',
          clinicalTerm: 'Type 2 diabetes mellitus with diabetic polyneuropathy',
          icd10Code: 'E11.42',
          icd10Display: 'Type 2 diabetes mellitus with diabetic polyneuropathy',
          snomedCode: '42344009',
          snomedDisplay: 'Polyneuropathy due to type 2 diabetes mellitus (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.96,
          evidenceSpan: 'Decreased sensation to 10-g Semmes-Weinstein monofilament ... Peripheral neuropathy in bilateral feet',
          reasoningChain: 'Stocking-distribution sensory loss and burning nocturnal paresthesias in longstanding T2DM.'
        },
        {
          id: 'dx-pcp-4',
          clinicalTerm: 'Type 2 diabetes mellitus with hyperglycemia',
          icd10Code: 'E11.65',
          icd10Display: 'Type 2 diabetes mellitus with hyperglycemia',
          snomedCode: '314772006',
          snomedDisplay: 'Uncontrolled type 2 diabetes mellitus (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.99,
          evidenceSpan: 'Hemoglobin A1c (HbA1c): 9.4 % ... Fasting Plasma Glucose: 238 mg/dL ... Type 2 diabetes, uncontrolled',
          reasoningChain: 'Documented "uncontrolled" diabetes with HbA1c 9.4% and fasting glucose 238 mg/dL maps to E11.65.'
        },
        {
          id: 'dx-pcp-5',
          clinicalTerm: 'Hypertensive chronic kidney disease with stage 3b CKD',
          icd10Code: 'I12.9',
          icd10Display: 'Hypertensive chronic kidney disease with stage 1 through stage 4 chronic kidney disease, or unspecified chronic kidney disease',
          snomedCode: '38481006',
          snomedDisplay: 'Hypertensive renal disease (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.93,
          evidenceSpan: 'essential HTN ... CKD stage 3b (eGFR 36)',
          reasoningChain: 'ICD-10-CM Official Guidelines (I.C.9.a.2) mandate combination code I12.9 whenever hypertension and CKD co-exist.'
        }
      ],
      medications: [
        {
          id: 'med-pcp-1',
          medicationName: 'Metformin HCl 1000 mg Oral Tablet',
          rxnormCode: '861004',
          rxnormDisplay: 'metformin hydrochloride 1000 MG Oral Tablet',
          dose: '1000 mg',
          route: 'PO',
          frequency: 'BID (2000 mg/day)',
          status: 'active',
          confidence: 0.99,
          evidenceSpan: 'Metformin HCl 1000 mg PO BID (2000 mg/day total)',
          interactionWarning: {
            severity: 'high',
            interactingAgent: 'Stage 3b CKD (eGFR 36 mL/min/1.73m²)',
            clinicalMechanism: 'Impaired renal clearance of biguanides at eGFR < 45 mL/min/1.73m² increases plasma metformin accumulation and Metformin-Associated Lactic Acidosis (MALA) risk.',
            recommendation: 'Reduce total daily Metformin dose by 50% (to maximum 500 mg PO BID / 1000 mg daily) when eGFR is 30-44 mL/min/1.73m².'
          }
        },
        {
          id: 'med-pcp-2',
          medicationName: 'Glipizide XL 10 mg Extended-Release Tablet',
          rxnormCode: '310489',
          rxnormDisplay: '24 HR glipizide 10 MG Extended Release Oral Tablet',
          dose: '10 mg',
          route: 'PO',
          frequency: 'Daily',
          status: 'active',
          confidence: 0.98,
          evidenceSpan: 'Glipizide XL 10 mg PO daily',
          interactionWarning: {
            severity: 'moderate',
            interactingAgent: 'Semaglutide 1 mg SC Weekly + Empagliflozin 10 mg initiation + eGFR 36',
            clinicalMechanism: 'Sulfonylurea insulin secretagogue activity combined with GLP-1 receptor agonist and reduced renal clearance increases delayed hypoglycemia risk.',
            recommendation: 'Consider reducing Glipizide dose by 50% or discontinuing when intensifying GLP-1 RA + SGLT2i therapy.'
          }
        },
        {
          id: 'med-pcp-3',
          medicationName: 'Semaglutide 1 mg Subcutaneous Pen',
          rxnormCode: '1991302',
          rxnormDisplay: 'semaglutide 1.34 MG/ML Pen Injector',
          dose: '1 mg',
          route: 'SC',
          frequency: 'Once Weekly',
          status: 'active',
          confidence: 0.98,
          evidenceSpan: 'Semaglutide (Ozempic) 1 mg SC once weekly',
          interactionWarning: null
        },
        {
          id: 'med-pcp-4',
          medicationName: 'Empagliflozin 10 mg Oral Tablet',
          rxnormCode: '1545653',
          rxnormDisplay: 'empagliflozin 10 MG Oral Tablet',
          dose: '10 mg',
          route: 'PO',
          frequency: 'Daily',
          status: 'active',
          confidence: 0.97,
          evidenceSpan: 'Start Empagliflozin 10mg daily for nephroprotection',
          interactionWarning: null
        },
        {
          id: 'med-pcp-5',
          medicationName: 'Lisinopril 40 mg Oral Tablet',
          rxnormCode: '314078',
          rxnormDisplay: 'lisinopril 40 MG Oral Tablet',
          dose: '40 mg',
          route: 'PO',
          frequency: 'Daily',
          status: 'active',
          confidence: 0.99,
          evidenceSpan: 'Lisinopril 40 mg PO daily',
          interactionWarning: null
        },
        {
          id: 'med-pcp-6',
          medicationName: 'Gabapentin 300 mg Oral Capsule',
          rxnormCode: '310431',
          rxnormDisplay: 'gabapentin 300 MG Oral Capsule',
          dose: '300 mg',
          route: 'PO',
          frequency: 'BID (Increased from QHS)',
          status: 'active',
          confidence: 0.97,
          evidenceSpan: 'increase Gabapentin to 300mg BID',
          interactionWarning: {
            severity: 'moderate',
            interactingAgent: 'Stage 3b CKD (eGFR 36 mL/min/1.73m²)',
            clinicalMechanism: 'Gabapentin is 100% renally excreted unchanged; titration in eGFR 30-59 mL/min can cause CNS somnolence, ataxia, and falls.',
            recommendation: 'Monitor closely for sedation/dizziness; max recommended dose at CrCl 30-59 mL/min is 200-700 mg BID.'
          }
        }
      ],
      labsAndVitals: [
        {
          id: 'obs-pcp-1',
          category: 'laboratory',
          measurementName: 'Hemoglobin A1c (HbA1c)',
          loincCode: '4548-4',
          loincDisplay: 'Hemoglobin A1c/Hemoglobin.total in Blood',
          value: 9.4,
          unit: '%',
          referenceRange: '4.0 - 5.6 %',
          interpretation: 'high',
          confidence: 0.99,
          evidenceSpan: 'Hemoglobin A1c (HbA1c): 9.4 % (Ref < 5.7%, Goal < 7.0%)',
          effectiveTime: '2026-11-06T08:30:00Z'
        },
        {
          id: 'obs-pcp-2',
          category: 'laboratory',
          measurementName: 'Urine Albumin-to-Creatinine Ratio (UACR)',
          loincCode: '14959-1',
          loincDisplay: 'Microalbumin/Creatinine [Mass Ratio] in Urine',
          value: 342,
          unit: 'mg/g',
          referenceRange: '< 30 mg/g',
          interpretation: 'high',
          confidence: 0.99,
          evidenceSpan: 'Urine Albumin-to-Creatinine Ratio (UACR): 342 mg/g (Ref < 30 mg/g)',
          effectiveTime: '2026-11-06T08:30:00Z'
        },
        {
          id: 'obs-pcp-3',
          category: 'laboratory',
          measurementName: 'eGFR (CKD-EPI)',
          loincCode: '62238-1',
          loincDisplay: 'Glomerular filtration rate/1.73 sq M.predicted [Volume Rate/Area] in Serum, Plasma or Blood by Creatinine-based formula (CKD-EPI)',
          value: 36,
          unit: 'mL/min/1.73m2',
          referenceRange: '> 60 mL/min/1.73m2',
          interpretation: 'low',
          confidence: 0.99,
          evidenceSpan: 'eGFR (CKD-EPI): 36 mL/min/1.73m2 (Down from 44 mL/min 6 mos ago)',
          effectiveTime: '2026-11-06T08:30:00Z'
        },
        {
          id: 'obs-pcp-4',
          category: 'laboratory',
          measurementName: 'Fasting Plasma Glucose',
          loincCode: '1558-6',
          loincDisplay: 'Fasting glucose [Mass/volume] in Serum or Plasma',
          value: 238,
          unit: 'mg/dL',
          referenceRange: '70 - 99 mg/dL',
          interpretation: 'high',
          confidence: 0.99,
          evidenceSpan: 'Fasting Plasma Glucose: 238 mg/dL (Ref 70-99 mg/dL)',
          effectiveTime: '2026-11-06T08:30:00Z'
        },
        {
          id: 'obs-pcp-5',
          category: 'vital-sign',
          measurementName: 'Body Mass Index (BMI)',
          loincCode: '39156-5',
          loincDisplay: 'Body mass index (BMI) [Ratio]',
          value: 32.8,
          unit: 'kg/m2',
          referenceRange: '18.5 - 24.9 kg/m2',
          interpretation: 'high',
          confidence: 0.99,
          evidenceSpan: 'BMI 32.8 kg/m2',
          effectiveTime: '2026-11-08T10:15:00Z'
        },
        {
          id: 'obs-pcp-6',
          category: 'vital-sign',
          measurementName: 'Systolic Blood Pressure',
          loincCode: '8480-6',
          loincDisplay: 'Systolic blood pressure',
          value: 146,
          unit: 'mmHg',
          referenceRange: '90 - 120 mmHg',
          interpretation: 'high',
          confidence: 0.99,
          evidenceSpan: 'BP 146/88 mmHg',
          effectiveTime: '2026-11-08T10:15:00Z'
        }
      ],
      codingAuditFlags: [
        {
          id: 'cdi-pcp-1',
          severity: 'medication-safety',
          ambiguousQuote: 'Metformin HCl 1000 mg PO BID (2000 mg/day total) ... eGFR (CKD-EPI): 36 mL/min/1.73m2',
          issueCategory: 'Renal Dosing Threshold Exceeded (KDIGO / FDA Boxed Warning)',
          clinicalObservation: 'Patient continues full-dose Metformin (2,000 mg/day) despite eGFR falling from 44 to 36 mL/min/1.73m² (Stage 3b CKD). KDIGO guidelines recommend halving the dose to <= 1,000 mg/day when eGFR is 30-44 mL/min/1.73m².',
          cdiQueryPrompt: 'With eGFR now at 36 mL/min/1.73m² (Stage 3b CKD), please document whether Metformin 1000mg BID should be dose-reduced to 500mg BID and document medical decision-making.',
          potentialCodeUpgrade: 'Z79.84 (Long term current use of oral hypoglycemic drugs) + Medication Reconciliation Safety Intervention',
          financialOrQualityImpact: 'HEDIS/MIPS Medication Safety & Prevents Metformin-Associated Lactic Acidosis',
          resolved: false
        },
        {
          id: 'cdi-pcp-2',
          severity: 'hcc-specificity',
          ambiguousQuote: '1. Type 2 diabetes, uncontrolled (A1c 9.4%). 2. CKD stage 3b (eGFR 36)... 3. Peripheral neuropathy',
          issueCategory: 'Unlinked Diabetic Manifestations in Assessment Plan',
          clinicalObservation: 'Listing "Type 2 diabetes, uncontrolled" separately from CKD Stage 3b and Peripheral Neuropathy without explicit causal linkage risks abstracting E11.9 instead of E11.22 and E11.42 during automated claims scrubbing.',
          cdiQueryPrompt: 'Please confirm in the final assessment whether Stage 3b CKD with macroalbuminuria (UACR 342 mg/g) and bilateral pedal peripheral neuropathy are manifestations of Type 2 Diabetes Mellitus.',
          potentialCodeUpgrade: 'E11.9 → E11.22 (T2DM w/ diabetic CKD) + E11.42 (T2DM w/ diabetic polyneuropathy) + E11.65',
          financialOrQualityImpact: 'CMS-HCC V28 Category 37 (Diabetes with Chronic Complications · RAF +0.166)',
          resolved: false
        },
        {
          id: 'cdi-pcp-3',
          severity: 'hcc-specificity',
          ambiguousQuote: 'BMI 32.8 kg/m2 | Weight 87.2 kg',
          issueCategory: 'Vitals-Only Obesity Without Corresponding Diagnosis',
          clinicalObservation: 'BMI of 32.8 kg/m² meets Class I Obesity criteria, which is clinically relevant to insulin resistance and Semaglutide therapy, but coders cannot assign Z68.32 without a provider-documented diagnosis of obesity.',
          cdiQueryPrompt: 'BMI is recorded at 32.8 kg/m². Please document the clinical diagnosis of Class I Obesity (E66.9 / E66.01) if clinically applicable to the patient’s metabolic management.',
          potentialCodeUpgrade: 'Add E66.9 (Obesity, unspecified) + Z68.32 (BMI 32.0-32.9, adult)',
          financialOrQualityImpact: 'Completes HEDIS BMI Adult Assessment & GLP-1 Prior Authorization documentation',
          resolved: false
        }
      ],
      extractionMode: 'precomputed-gold',
      latencyMs: 34,
      schemaValid: true
    }
  },
  {
    id: 'discharge-summary',
    title: 'Hospital Discharge Summary — COPD Exacerbation, Pneumonia & AFib',
    shortLabel: '03. Discharge Summary',
    setting: 'Inpatient Pulmonary & Hospitalist Service · 4-Day Stay',
    chiefComplaint: 'Severe COPD exacerbation with acute hypoxic respiratory failure & RLL pneumonia',
    rawNote: `INPATIENT HOSPITAL DISCHARGE SUMMARY
PATIENT: Kowalski, Walter S. | MRN: 612-04-918 | DOB: 1952-09-03 (74yo M)
ADMIT DATE: 2026-11-04 | DISCHARGE DATE: 2026-11-08 | ATTENDING: Dr. Ibrahim Mohammed, MD

PRINCIPAL DIAGNOSIS:
Acute exacerbation of severe GOLD Stage III COPD complicated by right lower lobe community-acquired pneumonia and acute hypoxic respiratory failure.

HOSPITAL COURSE:
74yo M w/ 50 pack-year smoking history (former smoker, quit 2019), GOLD III COPD (FEV1 41% predicted), paroxysmal atrial fibrillation on Apixaban, and HTN admitted w/ productive purulent cough, fever (38.7 °C), severe dyspnea, and room air SpO2 84%. ABG on admission showed pH 7.33, PaCO2 56 mmHg, PaO2 52 mmHg on RA. CXR demonstrated right lower lobe consolidation.

Patient was initiated on BiPAP in the ED with rapid improvement in work of breathing, then transitioned to high-flow nasal cannula and weaned to 2L NC (baseline home O2 requirement). Treated w/ IV Ceftriaxone + Azithromycin, transitioned to PO Doxycycline 100mg BID to complete a 7-day course. Received IV Methylprednisolone tapered to Prednisone 40mg PO daily x5 days.

On HD#2, patient developed recurrent rapid atrial fibrillation (HR 138 bpm) converter-resistant to metoprolol; Cardiology initiated Amiodarone 200mg PO BID loading dose alongside home Apixaban 5mg PO BID. Steroid-induced hyperglycemia noted (fingerstick glucoses 240-290 mg/dL) managed w/ sliding scale insulin lispro.

DISCHARGE VITALS & LABS (2026-11-08 08:00):
BP 128/76 mmHg | HR 74 bpm (sinus rhythm) | RR 18 /min | Temp 36.7 °C | SpO2 93% on 2L NC
- WBC Count: 8.9 x10^3/uL (Down from 16.4 on admit) [NORMAL]
- Point-of-Care Blood Glucose: 248 mg/dL (Ref 70-140 mg/dL) [HIGH]
- Arterial PaCO2 (Admission ABG): 56 mmHg (Ref 35-45 mmHg) [HIGH]
- Arterial PaO2 (Admission ABG): 52 mmHg (Ref 80-100 mmHg) [CRITICAL LOW]
- Serum Creatinine: 1.12 mg/dL (Ref 0.70-1.30 mg/dL) [NORMAL]

DISCHARGE MEDICATIONS:
1. Prednisone 40 mg PO daily x 3 remaining days (then stop)
2. Doxycycline Hyclate 100 mg PO BID x 3 remaining days
3. Amiodarone 200 mg PO BID x 7 days, then 200 mg PO daily
4. Apixaban 5 mg PO BID
5. Fluticasone-Umeclidinium-Vilanterol (Trelegy Ellipta) 100-62.5-25 mcg INH 1 puff daily
6. Albuterol-Ipratropium (Combivent Respimat) 1 inhalation QID PRN shortness of breath`,
    precomputedResult: {
      patient: {
        id: 'pat-61204918',
        name: 'Walter S. Kowalski',
        mrn: '612-04-918',
        dob: '1952-09-03',
        age: 74,
        sex: 'male',
        encounterType: 'Inpatient Hospital Discharge Summary',
        encounterClassCode: 'IMP',
        encounterDate: '2026-11-08T08:00:00Z',
        attendingClinician: 'Dr. Ibrahim Mohammed, MD'
      },
      chainOfThoughtSummary: [
        'Mapped dual COPD linkages per ICD-10-CM J44 coding rules: COPD with acute lower respiratory infection (J44.0) AND COPD with acute exacerbation (J44.1), sequenced alongside RLL Pneumonia (J18.9).',
        'Verified ABG acid-base & gas exchange discrepancy: Principal diagnosis states "acute hypoxic respiratory failure", yet admission ABG shows pH 7.33 and PaCO2 56 mmHg with BiPAP requirement -> Triggered high-priority CDI query for Acute on Chronic Hypoxic and Hypercapnic Respiratory Failure (J96.21 + J96.22).',
        'Identified corticosteroid adverse drug effect: "Steroid-induced hyperglycemia" with glucose 248 mg/dL -> Mapped to Drug-induced secondary diabetes/hyperglycemia (R73.9 / E09.65) + T38.0X5A (Adverse effect of glucocorticoids).',
        'Detected P-gp / CYP3A4 drug-drug interaction: Newly initiated Amiodarone 200mg BID co-prescribed with Apixaban 5mg BID increases systemic Apixaban AUC by ~40%.'
      ],
      diagnoses: [
        {
          id: 'dx-dc-1',
          clinicalTerm: 'Chronic obstructive pulmonary disease with acute exacerbation',
          icd10Code: 'J44.1',
          icd10Display: 'Chronic obstructive pulmonary disease with (acute) exacerbation',
          snomedCode: '195951007',
          snomedDisplay: 'Acute exacerbation of chronic obstructive airways disease (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.99,
          evidenceSpan: 'Acute exacerbation of severe GOLD Stage III COPD',
          reasoningChain: 'Principal diagnosis of GOLD III COPD exacerbation treated with systemic corticosteroids and bronchodilators.'
        },
        {
          id: 'dx-dc-2',
          clinicalTerm: 'Chronic obstructive pulmonary disease with acute lower respiratory infection',
          icd10Code: 'J44.0',
          icd10Display: 'Chronic obstructive pulmonary disease with (acute) lower respiratory infection',
          snomedCode: '313296004',
          snomedDisplay: 'Mild chronic obstructive pulmonary disease with acute lower respiratory infection (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.98,
          evidenceSpan: 'COPD complicated by right lower lobe community-acquired pneumonia',
          reasoningChain: 'ICD-10-CM instructional note under J44.0 requires assigning both J44.0 and the specific lower respiratory infection code (J18.9).'
        },
        {
          id: 'dx-dc-3',
          clinicalTerm: 'Acute respiratory failure with hypoxia',
          icd10Code: 'J96.01',
          icd10Display: 'Acute respiratory failure with hypoxia',
          snomedCode: '371820004',
          snomedDisplay: 'Acute respiratory failure with hypoxemia (disorder)',
          clinicalStatus: 'resolved',
          verificationStatus: 'confirmed',
          confidence: 0.97,
          evidenceSpan: 'acute hypoxic respiratory failure ... SpO2 84% ... PaO2 52 mmHg on RA',
          reasoningChain: 'Admission PaO2 52 mmHg and SpO2 84% on room air requiring non-invasive positive pressure ventilation (BiPAP).'
        },
        {
          id: 'dx-dc-4',
          clinicalTerm: 'Community-acquired lobar pneumonia, right lower lobe',
          icd10Code: 'J18.1',
          icd10Display: 'Lobar pneumonia, unspecified organism',
          snomedCode: '278516003',
          snomedDisplay: 'Lobar pneumonia (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.96,
          evidenceSpan: 'right lower lobe community-acquired pneumonia ... CXR demonstrated right lower lobe consolidation',
          reasoningChain: 'Radiographic RLL consolidation with fever (38.7 °C) and leukocytosis (16.4k) treated with Ceftriaxone + Doxycycline.'
        },
        {
          id: 'dx-dc-5',
          clinicalTerm: 'Paroxysmal atrial fibrillation',
          icd10Code: 'I48.0',
          icd10Display: 'Paroxysmal atrial fibrillation',
          snomedCode: '282825002',
          snomedDisplay: 'Paroxysmal atrial fibrillation (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.98,
          evidenceSpan: 'paroxysmal atrial fibrillation on Apixaban ... recurrent rapid atrial fibrillation (HR 138 bpm)',
          reasoningChain: 'Recurrent inpatient rapid episode converted to sinus rhythm with Amiodarone loading.'
        },
        {
          id: 'dx-dc-6',
          clinicalTerm: 'Glucocorticoid-induced hyperglycemia (adverse effect of therapeutic steroid)',
          icd10Code: 'T38.0X5A',
          icd10Display: 'Adverse effect of glucocorticoids and synthetic analogues, initial encounter',
          snomedCode: '408547000',
          snomedDisplay: 'Steroid-induced hyperglycemia (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.94,
          evidenceSpan: 'Steroid-induced hyperglycemia noted (fingerstick glucoses 240-290 mg/dL)',
          reasoningChain: 'Explicit causal attribution of hyperglycemia to IV Methylprednisolone / PO Prednisone therapy.'
        }
      ],
      medications: [
        {
          id: 'med-dc-1',
          medicationName: 'Amiodarone HCl 200 mg Oral Tablet',
          rxnormCode: '197361',
          rxnormDisplay: 'amiodarone hydrochloride 200 MG Oral Tablet',
          dose: '200 mg',
          route: 'PO',
          frequency: 'BID x 7 days, then Daily',
          status: 'active',
          confidence: 0.99,
          evidenceSpan: 'Amiodarone 200 mg PO BID x 7 days, then 200 mg PO daily',
          interactionWarning: {
            severity: 'high',
            interactingAgent: 'Apixaban 5 mg PO BID',
            clinicalMechanism: 'Amiodarone inhibits dual P-glycoprotein (P-gp) efflux and hepatic CYP3A4 metabolism, increasing systemic Apixaban exposure and major bleeding risk in elderly patients.',
            recommendation: 'Monitor closely for bruising, melena, or hemoglobin drop; coordinate outpatient Cardiology + Anticoagulation Clinic follow-up within 7 days.'
          }
        },
        {
          id: 'med-dc-2',
          medicationName: 'Apixaban 5 mg Oral Tablet',
          rxnormCode: '1364430',
          rxnormDisplay: 'apixaban 5 MG Oral Tablet',
          dose: '5 mg',
          route: 'PO',
          frequency: 'BID',
          status: 'active',
          confidence: 0.99,
          evidenceSpan: 'Apixaban 5 mg PO BID',
          interactionWarning: {
            severity: 'high',
            interactingAgent: 'Amiodarone 200 mg BID (Dual P-gp/CYP3A4 Inhibitor)',
            clinicalMechanism: 'Pharmacokinetic elevation of direct Factor Xa inhibitor plasma levels during oral Amiodarone loading.',
            recommendation: 'Counsel patient on bleeding precautions at discharge.'
          }
        },
        {
          id: 'med-dc-3',
          medicationName: 'Prednisone 40 mg Oral Tablet',
          rxnormCode: '312615',
          rxnormDisplay: 'prednisone 20 MG Oral Tablet',
          dose: '40 mg',
          route: 'PO',
          frequency: 'Daily x 3 days',
          status: 'active',
          confidence: 0.98,
          evidenceSpan: 'Prednisone 40 mg PO daily x 3 remaining days (then stop)',
          interactionWarning: {
            severity: 'moderate',
            interactingAgent: 'Blood Glucose 248 mg/dL (Steroid-Induced Hyperglycemia)',
            clinicalMechanism: 'Glucocorticoids induce hepatic gluconeogenesis and peripheral insulin resistance.',
            recommendation: 'Discharge blood glucose is 248 mg/dL with 3 days of Prednisone remaining; ensure outpatient glucose monitoring plan.'
          }
        },
        {
          id: 'med-dc-4',
          medicationName: 'Doxycycline Hyclate 100 mg Oral Tablet',
          rxnormCode: '1650142',
          rxnormDisplay: 'doxycycline hyclate 100 MG Oral Tablet',
          dose: '100 mg',
          route: 'PO',
          frequency: 'BID x 3 days',
          status: 'active',
          confidence: 0.99,
          evidenceSpan: 'Doxycycline Hyclate 100 mg PO BID x 3 remaining days',
          interactionWarning: null
        },
        {
          id: 'med-dc-5',
          medicationName: 'Fluticasone-Umeclidinium-Vilanterol 100-62.5-25 mcg Inhaler',
          rxnormCode: '1986821',
          rxnormDisplay: 'fluticasone furoate 0.1 MG/ACTUAT / umeclidinium 0.0625 MG/ACTUAT / vilanterol 0.025 MG/ACTUAT Dry Powder Inhaler',
          dose: '1 puff',
          route: 'INH',
          frequency: 'Daily',
          status: 'active',
          confidence: 0.98,
          evidenceSpan: 'Fluticasone-Umeclidinium-Vilanterol (Trelegy Ellipta) 100-62.5-25 mcg INH 1 puff daily',
          interactionWarning: null
        }
      ],
      labsAndVitals: [
        {
          id: 'obs-dc-1',
          category: 'laboratory',
          measurementName: 'Arterial PaO2 (Admission ABG)',
          loincCode: '2703-7',
          loincDisplay: 'Oxygen [Partial pressure] in Arterial blood',
          value: 52,
          unit: 'mmHg',
          referenceRange: '80 - 100 mmHg',
          interpretation: 'critical-low',
          confidence: 0.99,
          evidenceSpan: 'Arterial PaO2 (Admission ABG): 52 mmHg (Ref 80-100 mmHg)',
          effectiveTime: '2026-11-04T14:20:00Z'
        },
        {
          id: 'obs-dc-2',
          category: 'laboratory',
          measurementName: 'Arterial PaCO2 (Admission ABG)',
          loincCode: '2019-8',
          loincDisplay: 'Carbon dioxide [Partial pressure] in Arterial blood',
          value: 56,
          unit: 'mmHg',
          referenceRange: '35 - 45 mmHg',
          interpretation: 'high',
          confidence: 0.99,
          evidenceSpan: 'Arterial PaCO2 (Admission ABG): 56 mmHg (Ref 35-45 mmHg)',
          effectiveTime: '2026-11-04T14:20:00Z'
        },
        {
          id: 'obs-dc-3',
          category: 'laboratory',
          measurementName: 'Point-of-Care Blood Glucose (Discharge)',
          loincCode: '2339-0',
          loincDisplay: 'Glucose [Mass/volume] in Blood',
          value: 248,
          unit: 'mg/dL',
          referenceRange: '70 - 140 mg/dL',
          interpretation: 'high',
          confidence: 0.99,
          evidenceSpan: 'Point-of-Care Blood Glucose: 248 mg/dL (Ref 70-140 mg/dL)',
          effectiveTime: '2026-11-08T08:00:00Z'
        },
        {
          id: 'obs-dc-4',
          category: 'laboratory',
          measurementName: 'WBC Count (Discharge)',
          loincCode: '6690-2',
          loincDisplay: 'Leukocytes [#/volume] in Blood by Automated count',
          value: 8.9,
          unit: '10*3/uL',
          referenceRange: '4.5 - 11.0 10*3/uL',
          interpretation: 'normal',
          confidence: 0.99,
          evidenceSpan: 'WBC Count: 8.9 x10^3/uL (Down from 16.4 on admit)',
          effectiveTime: '2026-11-08T08:00:00Z'
        },
        {
          id: 'obs-dc-5',
          category: 'vital-sign',
          measurementName: 'Oxygen Saturation (Discharge on 2L NC)',
          loincCode: '59408-5',
          loincDisplay: 'Oxygen saturation in Arterial blood by Pulse oximetry',
          value: 93,
          unit: '%',
          referenceRange: '92 - 100 %',
          interpretation: 'normal',
          confidence: 0.99,
          evidenceSpan: 'SpO2 93% on 2L NC',
          effectiveTime: '2026-11-08T08:00:00Z'
        }
      ],
      codingAuditFlags: [
        {
          id: 'cdi-dc-1',
          severity: 'high-impact-drg',
          ambiguousQuote: 'ABG on admission showed pH 7.33, PaCO2 56 mmHg, PaO2 52 mmHg on RA ... initiated on BiPAP',
          issueCategory: 'Undocumented Hypercapnic Component & Chronic Baseline O2',
          clinicalObservation: 'Principal diagnosis specifies "acute hypoxic respiratory failure", but admission ABG demonstrates acute respiratory acidosis with hypercapnia (pH 7.33, PaCO2 56 mmHg) treated with BiPAP, and patient is on chronic home 2L O2.',
          cdiQueryPrompt: 'Given admission ABG (pH 7.33, PaCO2 56, PaO2 52), BiPAP therapy, and baseline 2L home O2, please clarify if the respiratory failure was Acute-on-Chronic Hypoxic AND Hypercapnic Respiratory Failure.',
          potentialCodeUpgrade: 'J96.01 → J96.21 (Acute and chronic respiratory failure with hypoxia) + J96.22 (with hypercapnia) + Z99.81 (Dependence on supplemental oxygen)',
          financialOrQualityImpact: 'Ensures full clinical validation for Non-Invasive Ventilation (ICD-10-PCS 5A09357) & SOI/ROM Tier 3',
          resolved: false
        },
        {
          id: 'cdi-dc-2',
          severity: 'clinical-validation',
          ambiguousQuote: 'Steroid-induced hyperglycemia noted (fingerstick glucoses 240-290 mg/dL)',
          issueCategory: 'Steroid-Induced Hyperglycemia vs Drug-Induced Diabetes Mellitus',
          clinicalObservation: 'In ICD-10-CM, "steroid-induced hyperglycemia" maps to transient elevated glucose (R73.9 + T38.0X5A), whereas "steroid-induced diabetes mellitus" maps to E09.65 (CC).',
          cdiQueryPrompt: 'With persistent blood glucoses of 240-290 mg/dL requiring insulin lispro, does this represent transient Steroid-Induced Hyperglycemia (R73.9) or Drug-Induced Secondary Diabetes Mellitus (E09.65)?',
          potentialCodeUpgrade: 'R73.9 → E09.65 (Drug or chemical induced diabetes mellitus with hyperglycemia)',
          financialOrQualityImpact: 'Clarifies Secondary CC status & Discharge Glucose Monitoring Plan',
          resolved: false
        }
      ],
      extractionMode: 'precomputed-gold',
      latencyMs: 36,
      schemaValid: true
    }
  },
  {
    id: 'telehealth-triage',
    title: 'Telehealth Triage Transcript — Migraine with Aura & Serotonin Risk',
    shortLabel: '04. Telehealth Transcript',
    setting: 'Virtual Urgent Care & Neurology Triage · Audio/Video Transcript',
    chiefComplaint: 'Severe throbbing unilateral headache with visual zig-zag aura, took 2 doses of Sumatriptan on Sertraline',
    rawNote: `TELEHEALTH VIDEO TRIAGE TRANSCRIPT (ASR + CLINICIAN SUMMARY)
PATIENT: Alvarez, Sofia L. | MRN: 923-55-310 | DOB: 1984-05-19 (42yo F)
SESSION TIMESTAMP: 2026-11-08 20:05 | CLINICIAN: Dr. Ibrahim Mohammed, MD

[00:12] DR. MOHAMMED: Hi Sofia, I can see and hear you clearly. Tell me what's going on tonight.
[00:19] PATIENT: Hi Doctor. Around 2:00 PM I started seeing shimmering zig-zag lines in my right visual field for about 25 minutes, and then a pounding left-sided headache hit me like a hammer. I'm nauseous and hiding in a dark bedroom because the light hurts my eyes.
[00:48] DR. MOHAMMED: Have you had any slurred speech, facial droop, weakness in your arms or legs, or fever/neck stiffness?
[00:56] PATIENT: No weakness or fever, and my speech is normal. Just the classic flashing zig-zag aura I get with my migraines, except this one hasn't broken after 6 hours.
[01:14] DR. MOHAMMED: What medications have you taken today, and what are your regular daily prescriptions?
[01:22] PATIENT: I take Sertraline 100 mg every morning for anxiety—my psychiatrist increased it from 50 mg to 100 mg last week. Today for the migraine, I took Sumatriptan 100 mg at 2:30 PM, and another Sumatriptan 100 mg at 5:30 PM. I've also been taking Ibuprofen 800 mg three times a day almost every day for the past 3 weeks for tension headaches.
[01:58] DR. MOHAMMED: Are you feeling any chest pressure, jitteriness, tremor, sweating, or racing heart since taking the second Sumatriptan?
[02:08] PATIENT: Actually yes, my hands feel a little shaky/tremulous, I'm slightly sweaty, and I felt 15 minutes of mild throat/chest tightness right after the second Sumatriptan tablet.
[02:29] DR. MOHAMMED: Let's check your home blood pressure cuff and pulse oximeter readings right now on camera.
[02:55] PATIENT (Reading Home Cuff): Blood pressure is 152/96 mmHg, heart rate is 106 bpm. Thermometer says 37.3 °C. SpO2 is 99%.

CLINICIAN TRIAGE NOTE:
- Classical migraine with visual aura, refractory (> 6 hours), status migrainosus vs medication overuse headache (taking Ibuprofen 800mg TID x3 weeks).
- Patient took 200 mg total Sumatriptan today within 3 hours of recent Sertraline dose escalation to 100 mg daily; now exhibiting mild tremor, diaphoresis, tachycardia (HR 106), and transient triptan chest tightness + BP 152/96.
- Advised to HOLD all further triptans and serotonergic agents tonight, administer Ondansetron 4 mg ODT for nausea, hydrate, and present to ED if tremor/hyperreflexia/chest pain recurs.`,
    precomputedResult: {
      patient: {
        id: 'pat-92355310',
        name: 'Sofia L. Alvarez',
        mrn: '923-55-310',
        dob: '1984-05-19',
        age: 42,
        sex: 'female',
        encounterType: 'Telehealth Video Urgent Triage',
        encounterClassCode: 'VR',
        encounterDate: '2026-11-08T20:05:00Z',
        attendingClinician: 'Dr. Ibrahim Mohammed, MD'
      },
      chainOfThoughtSummary: [
        'Parsed conversational ASR dialogue: Visual shimmering zig-zag fortification spectra (25 min) followed by unilateral pulsatile cephalgia + photophobia + nausea -> Mapped to Intractable migraine with aura (G43.119).',
        'Filtered neurological red flags from dialogue: "[00:56] No weakness or fever, and my speech is normal" -> Excluded focal stroke/meningitis while preserving differential vigilance.',
        'Extracted medication overuse pattern from patient utterance: "Ibuprofen 800 mg three times a day almost every day for the past 3 weeks" -> Mapped to Medication overuse headache (G44.41).',
        'Flagged high-severity Serotonergic + Vasospastic interaction: Sumatriptan 100mg x2 (200mg total) + recent Sertraline titration to 100mg daily with tremor, diaphoresis, HR 106 bpm, and BP 152/96 mmHg.'
      ],
      diagnoses: [
        {
          id: 'dx-tele-1',
          clinicalTerm: 'Migraine with aura, intractable, without status migrainosus',
          icd10Code: 'G43.119',
          icd10Display: 'Migraine with aura, intractable, without status migrainosus',
          snomedCode: '4473006',
          snomedDisplay: 'Migraine with aura (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          confidence: 0.98,
          evidenceSpan: 'shimmering zig-zag lines in my right visual field ... pounding left-sided headache ... Classical migraine with visual aura, refractory',
          reasoningChain: 'Scintillating scotoma / fortification aura followed by unilateral headache refractory to two 100 mg doses of Sumatriptan.'
        },
        {
          id: 'dx-tele-2',
          clinicalTerm: 'Medication overuse headache (rebound headache from chronic NSAID use)',
          icd10Code: 'G44.41',
          icd10Display: 'Medication overuse headache, intractable',
          snomedCode: '230465000',
          snomedDisplay: 'Medication overuse headache (disorder)',
          clinicalStatus: 'active',
          verificationStatus: 'provisional',
          confidence: 0.92,
          evidenceSpan: 'taking Ibuprofen 800 mg three times a day almost every day for the past 3 weeks ... medication overuse headache',
          reasoningChain: 'NSAID consumption > 15 days/month for > 3 weeks precipitating refractory rebound headache cycle.'
        },
        {
          id: 'dx-tele-3',
          clinicalTerm: 'Mild serotonin toxicity / triptan adverse reaction (tremor, diaphoresis, chest tightness)',
          icd10Code: 'T43.225A',
          icd10Display: 'Adverse effect of selective serotonin reuptake inhibitors, initial encounter',
          snomedCode: '371631005',
          snomedDisplay: 'Serotonin syndrome (disorder)',
          clinicalStatus: 'suspected',
          verificationStatus: 'differential',
          confidence: 0.88,
          evidenceSpan: 'hands feel a little shaky/tremulous, I\'m slightly sweaty, and I felt 15 minutes of mild throat/chest tightness right after the second Sumatriptan',
          reasoningChain: 'Synergistic 5-HT1B/1D agonist (Sumatriptan 200mg) + SSRI (Sertraline 100mg) producing autonomic hyperactivity (HR 106, BP 152/96, diaphoresis) and tremor.'
        }
      ],
      medications: [
        {
          id: 'med-tele-1',
          medicationName: 'Sumatriptan 100 mg Oral Tablet',
          rxnormCode: '313185',
          rxnormDisplay: 'sumatriptan 100 MG Oral Tablet',
          dose: '100 mg (x2 doses = 200 mg today)',
          route: 'PO',
          frequency: 'PRN (Hold further doses)',
          status: 'hold',
          confidence: 0.99,
          evidenceSpan: 'took Sumatriptan 100 mg at 2:30 PM, and another Sumatriptan 100 mg at 5:30 PM',
          interactionWarning: {
            severity: 'high',
            interactingAgent: 'Sertraline 100 mg Daily + Elevated BP (152/96 mmHg)',
            clinicalMechanism: 'Additive serotonergic neurotransmission risks Serotonin Syndrome (tremor, diaphoresis, tachycardia); 5-HT1B receptor agonism causes coronary/peripheral vasoconstriction and blood pressure elevation.',
            recommendation: 'HOLD all further triptans; consider CGRP receptor antagonist (Ubrogepant/Rimegepant) for future abortive therapy in patients on high-dose SSRIs or with elevated BP.'
          }
        },
        {
          id: 'med-tele-2',
          medicationName: 'Sertraline 100 mg Oral Tablet',
          rxnormCode: '312938',
          rxnormDisplay: 'sertraline 100 MG Oral Tablet',
          dose: '100 mg',
          route: 'PO',
          frequency: 'Daily',
          status: 'active',
          confidence: 0.99,
          evidenceSpan: 'Sertraline 100 mg every morning for anxiety',
          interactionWarning: {
            severity: 'high',
            interactingAgent: 'Sumatriptan 100 mg + Ibuprofen 800 mg TID',
            clinicalMechanism: 'SSRI + Triptan increases serotonergic toxicity; SSRI + high-dose NSAID depletes platelet serotonin and increases upper GI bleeding risk by 3-4x.',
            recommendation: 'Hold next morning Sertraline dose if tremor/diaphoresis persists; add gastroprotection or taper NSAIDs.'
          }
        },
        {
          id: 'med-tele-3',
          medicationName: 'Ibuprofen 800 mg Oral Tablet',
          rxnormCode: '197807',
          rxnormDisplay: 'ibuprofen 800 MG Oral Tablet',
          dose: '800 mg',
          route: 'PO',
          frequency: 'TID (2,400 mg/day x 3 weeks)',
          status: 'discontinued',
          confidence: 0.98,
          evidenceSpan: 'Ibuprofen 800 mg three times a day almost every day for the past 3 weeks',
          interactionWarning: {
            severity: 'moderate',
            interactingAgent: 'Sertraline 100 mg + Blood Pressure 152/96 mmHg',
            clinicalMechanism: 'Chronic high-dose NSAID (2,400 mg/day) induces medication overuse headache, elevates systemic blood pressure, and increases GI ulceration with SSRIs.',
            recommendation: 'Discontinue daily Ibuprofen to break rebound headache cycle.'
          }
        },
        {
          id: 'med-tele-4',
          medicationName: 'Ondansetron 4 mg Orally Disintegrating Tablet',
          rxnormCode: '312086',
          rxnormDisplay: 'ondansetron 4 MG Disintegrating Oral Tablet',
          dose: '4 mg',
          route: 'PO (ODT)',
          frequency: 'Once PRN nausea',
          status: 'prn',
          confidence: 0.96,
          evidenceSpan: 'administer Ondansetron 4 mg ODT for nausea',
          interactionWarning: {
            severity: 'moderate',
            interactingAgent: 'Sertraline 100 mg + Sumatriptan 200 mg',
            clinicalMechanism: '5-HT3 antagonists (Ondansetron) possess mild additive serotonergic warning when combined with SSRIs and Triptans.',
            recommendation: 'Use single dose cautiously or substitute prochlorperazine/metoclopramide if serotonergic symptoms worsen.'
          }
        }
      ],
      labsAndVitals: [
        {
          id: 'obs-tele-1',
          category: 'vital-sign',
          measurementName: 'Systolic Blood Pressure (Home Cuff)',
          loincCode: '8480-6',
          loincDisplay: 'Systolic blood pressure',
          value: 152,
          unit: 'mmHg',
          referenceRange: '90 - 120 mmHg',
          interpretation: 'high',
          confidence: 0.98,
          evidenceSpan: 'Blood pressure is 152/96 mmHg',
          effectiveTime: '2026-11-08T20:08:00Z'
        },
        {
          id: 'obs-tele-2',
          category: 'vital-sign',
          measurementName: 'Diastolic Blood Pressure (Home Cuff)',
          loincCode: '8462-4',
          loincDisplay: 'Diastolic blood pressure',
          value: 96,
          unit: 'mmHg',
          referenceRange: '60 - 80 mmHg',
          interpretation: 'high',
          confidence: 0.98,
          evidenceSpan: 'Blood pressure is 152/96 mmHg',
          effectiveTime: '2026-11-08T20:08:00Z'
        },
        {
          id: 'obs-tele-3',
          category: 'vital-sign',
          measurementName: 'Heart Rate (Pulse Oximeter)',
          loincCode: '8867-4',
          loincDisplay: 'Heart rate',
          value: 106,
          unit: '/min',
          referenceRange: '60 - 100 /min',
          interpretation: 'high',
          confidence: 0.99,
          evidenceSpan: 'heart rate is 106 bpm',
          effectiveTime: '2026-11-08T20:08:00Z'
        },
        {
          id: 'obs-tele-4',
          category: 'vital-sign',
          measurementName: 'Oxygen Saturation (Home Pulse Oximeter)',
          loincCode: '59408-5',
          loincDisplay: 'Oxygen saturation in Arterial blood by Pulse oximetry',
          value: 99,
          unit: '%',
          referenceRange: '95 - 100 %',
          interpretation: 'normal',
          confidence: 0.99,
          evidenceSpan: 'SpO2 is 99%',
          effectiveTime: '2026-11-08T20:08:00Z'
        }
      ],
      codingAuditFlags: [
        {
          id: 'cdi-tele-1',
          severity: 'clinical-validation',
          ambiguousQuote: 'Classical migraine with visual aura, refractory (> 6 hours), status migrainosus vs medication overuse headache',
          issueCategory: 'Duration Threshold for Status Migrainosus (ICHD-3 / ICD-10-CM)',
          clinicalObservation: 'ICHD-3 and ICD-10-CM define "Status migrainosus" (G43.111 / G43.101) as a debilitating migraine attack lasting > 72 hours. Documenting "status migrainosus" for a 6-hour attack creates a clinical validation denial risk.',
          cdiQueryPrompt: 'The patient reports headache onset at 2:00 PM today (6 hours duration). Please clarify if the diagnosis is Intractable Migraine with Aura without Status Migrainosus (G43.119) plus Medication Overuse Headache (G44.41).',
          potentialCodeUpgrade: 'G43.101 (Status migrainosus) → G43.119 (Migraine with aura, intractable, without status migrainosus) + G44.41',
          financialOrQualityImpact: 'Prevents payer clinical validation audit denial on >72h duration criterion',
          resolved: false
        },
        {
          id: 'cdi-tele-2',
          severity: 'medication-safety',
          ambiguousQuote: 'hands feel a little shaky/tremulous, I\'m slightly sweaty, and I felt 15 minutes of mild throat/chest tightness right after the second Sumatriptan',
          issueCategory: 'Unlinked Adverse Drug Effect (Triptan Chest Sensation & Serotonergic Toxicity)',
          clinicalObservation: 'Patient exhibits tremor, diaphoresis, tachycardia (106 bpm), and transient throat/chest tightness following 200 mg Sumatriptan on Sertraline 100 mg, but no ICD-10-CM adverse effect T-code is documented.',
          cdiQueryPrompt: 'Please specify whether the patient’s tremor, diaphoresis, and transient chest tightness represent an Adverse Effect of Triptans (T39.8X5A) and/or Mild Serotonin Toxicity secondary to SSRI + Triptan co-administration.',
          potentialCodeUpgrade: 'R07.89 (Chest tightness) → T39.8X5A (Adverse effect of other nonopioid analgesics/antimigraine drugs) + R45.88 / R25.1',
          financialOrQualityImpact: 'Captures External Cause / Adverse Drug Event (ADE) quality metric & CGRP step-therapy exception justification',
          resolved: false
        }
      ],
      extractionMode: 'precomputed-gold',
      latencyMs: 31,
      schemaValid: true
    }
  }
];
