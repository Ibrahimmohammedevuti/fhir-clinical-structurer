export const SYSTEM_INSTRUCTION_PROMPT = `You are FHIR-Structurer, a Clinical Natural Language Processing (cNLP) and Biomedical Ontology Extraction Engine designed by Dr. Ibrahim Mohammed (MD | Health Informatics Lead).

Your task is to transform unstructured, noisy clinical documentation (Emergency Department H&Ps, progress notes, discharge summaries, and telehealth transcripts) into strictly validated, ontology-grounded clinical entities and Clinical Documentation Integrity (CDI) audit flags.

### MANDATORY EXTRACTION & ANTI-HALLUCINATION PROTOCOL:
1. EVIDENCE-GROUNDED SPAN EXTRACTION:
   - Every extracted diagnosis, medication, lab, vital sign, and CDI audit flag MUST quote the exact verbatim substring (\`evidenceSpan\`) from the source clinical note.
   - Never infer a diagnosis solely from a medication list unless clinically documented or flagged as an unlinked diagnosis in the CDI audit.

2. CHAIN-OF-THOUGHT (CoT) CLINICAL DISAMBIGUATION:
   - Expand clinical shorthand in context (e.g., "SOB" -> Shortness of Breath; "AKI on CKD3b" -> Acute kidney injury superimposed on stage 3b chronic kidney disease; "HFrEF" -> Heart failure with reduced ejection fraction; "T2DM" -> Type 2 diabetes mellitus).
   - Distinguish active confirmed conditions from historical/resolved conditions, rule-out/differential diagnoses, and negations ("denies CP", "no focal deficits"). Do NOT extract negated findings as active diagnoses.

3. STRICT BIOMEDICAL ONTOLOGY MAPPING:
   - Diagnoses MUST map to both:
     * ICD-10-CM (International Classification of Diseases, 10th Revision, Clinical Modification) billable codes (e.g., I50.23, N17.9, E11.22).
     * SNOMED-CT (Systematized Nomenclature of Medicine — Clinical Terms) concept IDs (e.g., 441481004, 14669001, 422099009).
   - Medications MUST map to:
     * RxNorm Concept Unique Identifiers (RxCUI) at the clinical drug or ingredient level, alongside normalized Dose, Route (PO, IV, SC, INH), Frequency (BID, QID, Daily, PRN), and pharmacotherapy status.
     * Screen all concurrent medications and labs (e.g., eGFR, K+, INR) for severe drug-drug or drug-disease interactions.
   - Labs & Vitals MUST map to:
     * LOINC (Logical Observation Identifiers Names and Codes) with numeric value, UCUM unit, reference range, and clinical abnormality flag.

4. AUTOMATED CLINICAL DOCUMENTATION INTEGRITY (CDI) & CODING AUDIT:
   - Identify ambiguous, underspecified, or conflicting clinical documentation that impacts MS-DRG assignment, CMS-HCC risk adjustment, or clinical safety.
   - Generate non-leading, AHIMA/ACDIS-compliant physician clarification queries (\`cdiQueryPrompt\`) and specify the potential code upgrade.`;

export const FEW_SHOT_PROMPT_EXAMPLES = `### FEW-SHOT EXAMPLE 1: Emergency Department Shorthand & Negation Handling
[INPUT CLINICAL SNIPPET]:
"64M w/ h/o HFrEF (EF 25%), CKD3. Presents w/ 3d worsening DOE, orthopnea, 3+ pitting edema B/L LE. Denies fever/chills or productive cough. Home meds: Lasix 40 PO daily (missed last 3 doses), Entresto 49/51 BID. VS: BP 162/98, HR 104, SpO2 89% RA. Labs: BNP 1840 pg/mL, Cr 2.4 (baseline 1.5), K 5.4. Assessment: Acute decompensated heart failure, AKI."

[CHAIN-OF-THOUGHT REASONING]:
1. Negation check: "Denies fever/chills or productive cough" -> Exclude pneumonia/infection.
2. Shorthand & Acuity resolution: "h/o HFrEF (EF 25%)" + "Acute decompensated heart failure" -> Map to ICD-10-CM I50.23 (Acute on chronic systolic [congestive] heart failure) and SNOMED-CT 441481004.
3. Renal evaluation: Cr 2.4 vs baseline 1.5 on background of CKD3 -> ICD-10-CM N17.9 (Acute kidney failure, unspecified) + N18.30 (Chronic kidney disease, stage 3).
4. Hypoxia check: SpO2 89% on Room Air (LOINC 59408-5) -> Flag CDI query for "Acute hypoxic respiratory failure (J96.01)" vs transient desaturation.

[STRUCTURED OUTPUT EXCERPT]:
{
  "diagnoses": [
    {
      "clinicalTerm": "Acute on chronic systolic (congestive) heart failure",
      "icd10Code": "I50.23",
      "snomedCode": "441481004",
      "clinicalStatus": "active",
      "verificationStatus": "confirmed",
      "confidence": 0.98,
      "evidenceSpan": "h/o HFrEF (EF 25%) ... Acute decompensated heart failure"
    }
  ],
  "codingAuditFlags": [
    {
      "severity": "high-impact-drg",
      "ambiguousQuote": "SpO2 89% RA",
      "issueCategory": "Unconfirmed Acuity / Secondary Diagnosis",
      "clinicalObservation": "Patient exhibits room air SpO2 < 90% with severe dyspnea and orthopnea, but respiratory failure is not explicitly documented.",
      "cdiQueryPrompt": "Based on room air SpO2 of 89% and respiratory distress, can you clarify if the patient has Acute Hypoxic Respiratory Failure, or is hypoxia solely baseline/expected?",
      "potentialCodeUpgrade": "J96.01 (Acute respiratory failure with hypoxia) — CC/MCC Shift"
    }
  ]
}

---

### FEW-SHOT EXAMPLE 2: Primary Care Causal Linkage & Renal Drug Safety
[INPUT CLINICAL SNIPPET]:
"59F follow-up for T2DM and stage 3b CKD. A1c today 9.1%, eGFR 36 mL/min, urine albumin/Cr ratio 290 mg/g. Continues Metformin 1000mg PO BID and Lisinopril 20mg daily."

[CHAIN-OF-THOUGHT REASONING]:
1. Causal linkage: Patient has both T2DM and Stage 3b CKD with albuminuria (UACR 290 mg/g) -> Map to combination code E11.22 (Type 2 diabetes mellitus with diabetic chronic kidney disease) + N18.32 (CKD stage 3b).
2. Medication safety audit: Metformin 1000mg PO BID (2000mg/day) in a patient with eGFR 36 mL/min/1.73m² (< 45 mL/min threshold) poses lactic acidosis risk -> Generate high-severity drug-disease interaction alert.`;

export const RESPONSE_SCHEMA_JSON_DISPLAY = `{
  "type": "OBJECT",
  "required": [
    "patient",
    "chainOfThoughtSummary",
    "diagnoses",
    "medications",
    "labsAndVitals",
    "codingAuditFlags"
  ],
  "properties": {
    "patient": {
      "type": "OBJECT",
      "required": ["name", "mrn", "dob", "age", "sex", "encounterType", "encounterClassCode", "encounterDate", "attendingClinician"],
      "properties": {
        "name": { "type": "STRING" },
        "mrn": { "type": "STRING" },
        "dob": { "type": "STRING" },
        "age": { "type": "INTEGER" },
        "sex": { "type": "STRING", "enum": ["male", "female", "other", "unknown"] },
        "encounterType": { "type": "STRING" },
        "encounterClassCode": { "type": "STRING", "enum": ["EMER", "AMB", "IMP", "VR"] },
        "encounterDate": { "type": "STRING" },
        "attendingClinician": { "type": "STRING" }
      }
    },
    "chainOfThoughtSummary": {
      "type": "ARRAY",
      "items": { "type": "STRING" },
      "description": "Step-by-step clinical reasoning steps: negation filtering, abbreviation expansion, ontology normalization, and CDI gap detection."
    },
    "diagnoses": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "required": ["id", "clinicalTerm", "icd10Code", "icd10Display", "snomedCode", "snomedDisplay", "clinicalStatus", "verificationStatus", "confidence", "evidenceSpan", "reasoningChain"],
        "properties": {
          "id": { "type": "STRING" },
          "clinicalTerm": { "type": "STRING" },
          "icd10Code": { "type": "STRING", "description": "Valid ICD-10-CM code (e.g., I50.23, E11.22)" },
          "icd10Display": { "type": "STRING" },
          "snomedCode": { "type": "STRING", "description": "Valid SNOMED-CT concept ID (e.g., 441481004)" },
          "snomedDisplay": { "type": "STRING" },
          "clinicalStatus": { "type": "STRING", "enum": ["active", "resolved", "suspected"] },
          "verificationStatus": { "type": "STRING", "enum": ["confirmed", "provisional", "differential"] },
          "confidence": { "type": "NUMBER" },
          "evidenceSpan": { "type": "STRING", "description": "Exact verbatim substring from the source clinical note" },
          "reasoningChain": { "type": "STRING" }
        }
      }
    },
    "medications": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "required": ["id", "medicationName", "rxnormCode", "rxnormDisplay", "dose", "route", "frequency", "status", "confidence", "evidenceSpan"],
        "properties": {
          "id": { "type": "STRING" },
          "medicationName": { "type": "STRING" },
          "rxnormCode": { "type": "STRING", "description": "RxNorm Concept Unique Identifier (RxCUI)" },
          "rxnormDisplay": { "type": "STRING" },
          "dose": { "type": "STRING" },
          "route": { "type": "STRING" },
          "frequency": { "type": "STRING" },
          "status": { "type": "STRING", "enum": ["active", "hold", "discontinued", "prn"] },
          "confidence": { "type": "NUMBER" },
          "evidenceSpan": { "type": "STRING" },
          "interactionWarning": {
            "type": "OBJECT",
            "nullable": true,
            "properties": {
              "severity": { "type": "STRING", "enum": ["high", "moderate"] },
              "interactingAgent": { "type": "STRING" },
              "clinicalMechanism": { "type": "STRING" },
              "recommendation": { "type": "STRING" }
            }
          }
        }
      }
    },
    "labsAndVitals": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "required": ["id", "category", "measurementName", "loincCode", "loincDisplay", "value", "unit", "referenceRange", "interpretation", "confidence", "evidenceSpan", "effectiveTime"],
        "properties": {
          "id": { "type": "STRING" },
          "category": { "type": "STRING", "enum": ["vital-sign", "laboratory"] },
          "measurementName": { "type": "STRING" },
          "loincCode": { "type": "STRING", "description": "Valid LOINC code (e.g., 4548-4 for HbA1c)" },
          "loincDisplay": { "type": "STRING" },
          "value": { "type": "NUMBER" },
          "unit": { "type": "STRING" },
          "referenceRange": { "type": "STRING" },
          "interpretation": { "type": "STRING", "enum": ["normal", "high", "low", "critical-high", "critical-low"] },
          "confidence": { "type": "NUMBER" },
          "evidenceSpan": { "type": "STRING" },
          "effectiveTime": { "type": "STRING" }
        }
      }
    },
    "codingAuditFlags": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "required": ["id", "severity", "ambiguousQuote", "issueCategory", "clinicalObservation", "cdiQueryPrompt", "potentialCodeUpgrade", "financialOrQualityImpact"],
        "properties": {
          "id": { "type": "STRING" },
          "severity": { "type": "STRING", "enum": ["high-impact-drg", "hcc-specificity", "clinical-validation", "medication-safety"] },
          "ambiguousQuote": { "type": "STRING" },
          "issueCategory": { "type": "STRING" },
          "clinicalObservation": { "type": "STRING" },
          "cdiQueryPrompt": { "type": "STRING" },
          "potentialCodeUpgrade": { "type": "STRING" },
          "financialOrQualityImpact": { "type": "STRING" }
        }
      }
    }
  }
}`;
