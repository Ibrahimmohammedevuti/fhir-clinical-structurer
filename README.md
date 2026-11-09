# FHIR-Structurer: Few-Shot Clinical NLP & Ontology Extraction Engine

**Author:** Dr. Ibrahim Mohammed (MD | Health Informatics Lead)  
**Standards Supported:** HL7 FHIR R4 (v4.0.1) · US Core Profiles · ICD-10-CM · SNOMED-CT · RxNorm · LOINC · UCUM

---

## 1. Executive Overview

**FHIR-Structurer** is a clinical Natural Language Processing (cNLP) and biomedical ontology normalization engine that transforms messy, abbreviation-heavy unstructured clinical narratives (Emergency Department H&Ps, Ambulatory Progress Notes, Inpatient Discharge Summaries, and Telehealth ASR Transcripts) into:

1. **Ontology-Grounded Clinical Entities** mapped to `ICD-10-CM`, `SNOMED-CT`, `RxNorm` (with dose, route, frequency, and pharmacotherapy interaction alerts), and `LOINC`.
2. **Validated HL7 FHIR R4 Bundles** (`resourceType: "Bundle"`, `type: "collection"`) ready for EHR interoperability pipelines.
3. **Automated Clinical Documentation Integrity (CDI) & Coding Audits** that flag ambiguous or under-specified clinical documentation impacting `MS-DRG` severity tiers, `CMS-HCC` risk adjustment, and medication safety.

---

## 2. Few-Shot Prompting & Anti-Hallucination Strategy

Unconstrained Large Language Models frequently hallucinate non-existent ICD-10-CM codes, misinterpret negated clinical findings (e.g., *"denies chest pain or productive cough"*), or infer diagnoses solely from medication lists. **FHIR-Structurer** prevents these clinical NLP failure modes through a 4-layer prompt engineering architecture (inspectable directly in the application via the **"Inspect System Prompt & JSON Schema"** drawer):

### A. Verbatim Evidence Span Anchoring (`evidenceSpan`)
Every extracted entity (`ClinicalDiagnosis`, `ClinicalMedication`, `ClinicalLabVital`, and `ClinicalCodingAuditFlag`) is required by the schema to return an exact verbatim substring (`evidenceSpan`) from the source clinical note. In the UI, clicking **"Trace Span"** highlights and anchors the exact clinical phrase in the unstructured note panel.

### B. Chain-of-Thought (CoT) Clinical Disambiguation
Before emitting ontology codes, the model generates a structured `chainOfThoughtSummary` array performing:
- **Contextual Shorthand Expansion:** Disambiguates polysemous abbreviations (`HFrEF` $\rightarrow$ Heart failure with reduced ejection fraction; `RA` $\rightarrow$ Room Air vs. Rheumatoid Arthritis based on pulse oximetry context).
- **Negation & Temporality Filtering:** Excludes negated symptoms (*"denies dysuria, fever, or chills"*) and distinguishes historical/resolved conditions from acute encounter diagnoses.
- **ICD-10-CM Causal Combination Logic:** Applies official ICD-10-CM coding guidelines (such as the *"With"* convention in Section I.A.15) to synthesize combination codes like `E11.22` (*Type 2 diabetes mellitus with diabetic chronic kidney disease*) + `N18.32` (*CKD Stage 3b*) when both conditions are documented.

### C. Few-Shot Domain Exemplars
The prompt provides curated clinical input-output pairs demonstrating:
1. Acute decompensated heart failure (`I50.23` / `441481004`) with KDIGO Stage 2 AKI (`N17.9`) and room-air hypoxia (`SpO2 87% RA`) triggering a CDI query for *Acute Hypoxic Respiratory Failure* (`J96.01`).
2. Ambulatory Type 2 Diabetes follow-up with `eGFR 36 mL/min/1.73m²` triggering both causal combination coding (`E11.22`) and a high-severity renal dosing alert for high-dose `Metformin 1000 mg PO BID`.

### D. Constrained Decoding via `@google/genai` `responseSchema`
Server-side Gemini API calls (`/api/extract` in `server.ts`) enforce `responseMimeType: "application/json"` and a strict `Type.OBJECT` `responseSchema` so every response conforms deterministically to the TypeScript contract prior to FHIR serialization.

---

## 3. HL7 FHIR R4 Resource Mapping Specification

The decoupled FHIR R4 synthesis engine (`src/utils/fhirBuilder.ts`) maps extracted clinical entities into a standards-compliant `Bundle` (`type: "collection"`):

| Clinical Concept | FHIR R4 `resourceType` | US Core / FHIR Profile | Terminology System URI |
| :--- | :--- | :--- | :--- |
| **Demographics & MRN** | `Patient` | `us-core-patient` | `http://terminology.hl7.org/CodeSystem/v2-0203` (`MR`) |
| **Clinical Setting** | `Encounter` | `us-core-encounter` | `http://terminology.hl7.org/CodeSystem/v3-ActCode` (`EMER`, `AMB`, `IMP`, `VR`) |
| **Diagnoses & Problems** | `Condition` | `us-core-condition-problems-health-concerns` | Dual-coded:<br>• `http://hl7.org/fhir/sid/icd-10-cm`<br>• `http://snomed.info/sct` |
| **Medications & Regimens** | `MedicationRequest` | `us-core-medicationrequest` | `http://www.nlm.nih.gov/research/umls/rxnorm` (`RxCUI`) |
| **Labs & Vital Signs** | `Observation` | `vitalsigns` / `us-core-observation-lab` | `http://loinc.org` + `http://unitsofmeasure.org` (`UCUM`) |
| **Drug Interactions & CDI Flags** | `DetectedIssue` | `http://hl7.org/fhir/StructureDefinition/DetectedIssue` | `http://terminology.hl7.org/CodeSystem/v3-ActCode` (`DRG`, `CDI-AUDIT`) |

---

## 4. Pre-Loaded Clinical Benchmark Encounters

1. **01. Emergency Dept H&P (`ed-hp`)**: 68yo male with acute decompensated HFrEF (`I50.23`), hyperkalemia (`K+ 5.9 mEq/L` with peaked T-waves, `E87.5`), KDIGO Stage 2 AKI (`Cr 2.62 mg/dL`, `N17.9`), and a "Triple Whammy" nephrotoxic/hyperkalemic interaction (`Lisinopril` + `Spironolactone` + `Ibuprofen`).
2. **02. Primary Care Diabetes Follow-up (`pcp-dm2`)**: 57yo female with uncontrolled T2DM (`HbA1c 9.4%`, `E11.65`), diabetic CKD stage 3b (`eGFR 36`, `UACR 342 mg/g`, `E11.22` + `N18.32`), diabetic polyneuropathy (`E11.42`), and a critical renal dosing contraindiction (`Metformin 1000 mg BID` at `eGFR < 45`).
3. **03. Hospital Discharge Summary (`discharge-summary`)**: 74yo male with severe GOLD III COPD exacerbation (`J44.1` + `J44.0`), RLL lobar pneumonia (`J18.1`), admission respiratory acidosis (`pH 7.33, PaCO2 56, PaO2 52`), and a high-risk `Amiodarone` + `Apixaban` P-gp/CYP3A4 interaction.
4. **04. Telehealth Triage Transcript (`telehealth-triage`)**: Multi-turn ASR video triage transcript of a 42yo female with intractable migraine with visual aura (`G43.119`), NSAID medication overuse headache (`G44.41`), and serotonergic toxicity / triptan chest tightness after taking 200 mg `Sumatriptan` following recent `Sertraline` titration.
