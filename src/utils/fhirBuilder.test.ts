import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFhirBundle,
  validateFhirBundle,
  calculateExtractionMetrics,
  extractClinicalNoteDeterministic,
  FHIR_SYSTEM_URIS
} from './fhirBuilder';
import { CLINICAL_NOTE_PRESETS } from '../data/clinicalNotes';

test('all 4 clinical note presets build valid HL7 FHIR R4 Bundles with ICD-10-CM, SNOMED-CT, RxNorm, and LOINC codes', () => {
  assert.equal(CLINICAL_NOTE_PRESETS.length, 4);

  for (const preset of CLINICAL_NOTE_PRESETS) {
    const bundle = buildFhirBundle(preset.precomputedResult);
    const validation = validateFhirBundle(bundle);

    assert.equal(validation.isValid, true, `Preset ${preset.id} failed validation: ${validation.errors.join(', ')}`);
    assert.equal(bundle.resourceType, 'Bundle');
    assert.equal(bundle.type, 'collection');
    assert.ok(validation.resourceCounts.Patient >= 1);
    assert.ok(validation.resourceCounts.Encounter >= 1);
    assert.ok(validation.resourceCounts.Condition >= preset.precomputedResult.diagnoses.length);
    assert.ok(validation.resourceCounts.MedicationRequest >= preset.precomputedResult.medications.length);
    assert.ok(validation.resourceCounts.Observation >= preset.precomputedResult.labsAndVitals.length);

    // Check ontology URI counts
    assert.equal(validation.ontologyCounts.icd10, preset.precomputedResult.diagnoses.length);
    assert.equal(validation.ontologyCounts.snomed, preset.precomputedResult.diagnoses.length);
    assert.equal(validation.ontologyCounts.rxnorm, preset.precomputedResult.medications.length);
    assert.equal(validation.ontologyCounts.loinc, preset.precomputedResult.labsAndVitals.length);
  }
});

test('calculateExtractionMetrics computes accurate confidence and entity counts', () => {
  const edResult = CLINICAL_NOTE_PRESETS[0].precomputedResult;
  const metrics = calculateExtractionMetrics(edResult);

  assert.equal(
    metrics.totalEntities,
    edResult.diagnoses.length + edResult.medications.length + edResult.labsAndVitals.length
  );
  assert.ok(metrics.meanConfidence > 0.9 && metrics.meanConfidence <= 1.0);
  assert.ok(metrics.interactionCount >= 3);
  assert.equal(metrics.unresolvedAuditCount, edResult.codingAuditFlags.length);
});

test('extractClinicalNoteDeterministic extracts ontology codes from custom clinical notes', () => {
  const customNote = `PATIENT: Doe, Jane | MRN: 123-45-678 | 65yo F
  Presenting with acute decompensated HFrEF and Type 2 diabetes with CKD.
  Meds: Lisinopril 20mg PO daily, Spironolactone 25mg PO daily, Metformin 1000mg BID.
  Vitals: BP 158/94 mmHg | HR 108 bpm | SpO2 88%
  Labs: A1c 8.9%, Creatinine 2.1 mg/dL`;

  const result = extractClinicalNoteDeterministic(customNote);
  assert.equal(result.patient.mrn, '123-45-678');
  assert.ok(result.diagnoses.some((d) => d.icd10Code === 'I50.23'));
  assert.ok(result.diagnoses.some((d) => d.icd10Code === 'E11.22'));
  assert.ok(result.medications.some((m) => m.rxnormCode === '314077' && m.interactionWarning !== null));
  assert.ok(result.labsAndVitals.some((o) => o.loincCode === '59408-5' && o.value === 88));

  const bundle = buildFhirBundle(result);
  const json = JSON.stringify(bundle);
  assert.ok(json.includes(FHIR_SYSTEM_URIS.ICD10CM));
  assert.ok(json.includes(FHIR_SYSTEM_URIS.RXNORM));
});

import {
  tokenizeNoteWithConfidenceHeatmap,
  getHeatmapOpacityClasses
} from './heatmapTokenizer';

test('tokenizeNoteWithConfidenceHeatmap losslessly segments clinical notes and maps extraction certainty to opacity bands', () => {
  for (const preset of CLINICAL_NOTE_PRESETS) {
    const tokens = tokenizeNoteWithConfidenceHeatmap(
      preset.rawNote,
      preset.precomputedResult,
      preset.precomputedResult.diagnoses[0]?.evidenceSpan ?? null
    );

    // Lossless text reconstruction invariant
    const reconstructed = tokens.map((t) => t.text).join('');
    assert.equal(reconstructed, preset.rawNote);

    // Must contain multiple matched clinical segments
    const matchedTokens = tokens.filter((t) => t.match !== null);
    assert.ok(
      matchedTokens.length >= 8,
      `Expected >= 8 heatmap spans for ${preset.id}, got ${matchedTokens.length}`
    );

    // Verify focused span flag
    assert.ok(matchedTokens.some((t) => t.isFocused));

    // Verify opacity tiers differentiate ultra-high (0.99) vs low-review (<0.88)
    const ultraStyle = getHeatmapOpacityClasses('ultra-high', 0.99, false);
    const modStyle = getHeatmapOpacityClasses('moderate', 0.91, false);
    const lowStyle = getHeatmapOpacityClasses('low-review', 0.76, false);

    assert.ok(ultraStyle.opacityPercent > modStyle.opacityPercent);
    assert.notEqual(ultraStyle.bgClass, lowStyle.bgClass);
  }
});

import { buildPatientDemographicsChartData } from './fhirBuilder';

test('buildPatientDemographicsChartData classifies extracted patient age and sex into cohort distribution', () => {
  const edPatient = CLINICAL_NOTE_PRESETS[0].precomputedResult.patient; // 68yo male
  const edProfile = buildPatientDemographicsChartData(edPatient);
  assert.equal(edProfile.cohortBracket, '65+');
  assert.equal(edProfile.data.length, 3);
  assert.equal(edProfile.data.find((d) => d.bracket === '65+')?.isCurrentBracket, true);

  const pcpPatient = CLINICAL_NOTE_PRESETS[1].precomputedResult.patient; // 57yo female
  const pcpProfile = buildPatientDemographicsChartData(pcpPatient);
  assert.equal(pcpProfile.cohortBracket, '45-64');
  assert.equal(pcpProfile.data.find((d) => d.bracket === '45-64')?.isCurrentBracket, true);

  const telePatient = CLINICAL_NOTE_PRESETS[3].precomputedResult.patient; // 42yo female
  const teleProfile = buildPatientDemographicsChartData(telePatient);
  assert.equal(teleProfile.cohortBracket, '18-44');
  assert.equal(teleProfile.data.find((d) => d.bracket === '18-44')?.isCurrentBracket, true);
});


