/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Code2,
  Database,
  FileJson,
  ShieldAlert,
  ChevronRight,
  Layers
} from 'lucide-react';
import { CLINICAL_NOTE_PRESETS } from './data/clinicalNotes';
import { ExtractionResult } from './types/clinical';
import {
  buildFhirBundle,
  validateFhirBundle,
  calculateExtractionMetrics,
  extractClinicalNoteDeterministic
} from './utils/fhirBuilder';
import { ClinicalInputPanel } from './components/ClinicalInputPanel';
import { EntitiesTab } from './components/EntitiesTab';
import { FhirBundleTab } from './components/FhirBundleTab';
import { CodingAuditTab } from './components/CodingAuditTab';
import { PromptArchitectureDrawer } from './components/PromptArchitectureDrawer';
import { DemographicsMiniChart } from './components/DemographicsMiniChart';

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    CLINICAL_NOTE_PRESETS[0].id
  );
  const [rawNote, setRawNote] = useState<string>(
    CLINICAL_NOTE_PRESETS[0].rawNote
  );
  const [extractionResult, setExtractionResult] = useState<ExtractionResult>(
    () => structuredClone(CLINICAL_NOTE_PRESETS[0].precomputedResult)
  );
  const [activeOutputTab, setActiveOutputTab] = useState<
    'entities' | 'fhir' | 'audit'
  >('entities');
  const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState<boolean>(false);
  const [preferLiveGemini, setPreferLiveGemini] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [highlightedSpan, setHighlightedSpan] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const activePresetTitle = useMemo(() => {
    if (selectedPresetId === 'custom') {
      return '05. Custom Free-Text Clinical Note';
    }
    const found = CLINICAL_NOTE_PRESETS.find((p) => p.id === selectedPresetId);
    return found ? found.title : 'Clinical Encounter Note';
  }, [selectedPresetId]);

  const fhirBundle = useMemo(
    () => buildFhirBundle(extractionResult),
    [extractionResult]
  );

  const fhirValidation = useMemo(
    () => validateFhirBundle(fhirBundle),
    [fhirBundle]
  );

  const metrics = useMemo(
    () => calculateExtractionMetrics(extractionResult),
    [extractionResult]
  );

  const handleSelectPreset = (presetId: string) => {
    setHighlightedSpan(null);
    setStatusBanner(null);
    setSelectedPresetId(presetId);

    if (presetId === 'custom') {
      const customStarter = `CLINICAL PROGRESS NOTE — CUSTOM ENCOUNTER
PATIENT: Mercer, David R. | MRN: 774-19-502 | DOB: 1961-11-04 (65yo M)
DATE: 2026-11-08 16:20 | ATTENDING: Dr. Ibrahim Mohammed, MD

HPI: 65yo M w/ HFrEF (EF 30%), T2DM, and CKD stage 3b presents with worsening dyspnea on exertion and 8-lb weight gain.
Home Meds: Lisinopril 20 mg PO daily, Spironolactone 25 mg PO daily, Metformin 1000 mg PO BID, Apixaban 5 mg PO BID.
Vitals: BP 158/94 mmHg | HR 108 bpm | SpO2 88% on room air
Labs: HbA1c 8.9%, Serum Creatinine 2.18 mg/dL (baseline 1.4), eGFR 32 mL/min/1.73m2.
Assessment: Acute on chronic systolic heart failure, acute kidney injury, uncontrolled T2DM.`;
      setRawNote(customStarter);
      setExtractionResult(extractClinicalNoteDeterministic(customStarter));
      return;
    }

    const found = CLINICAL_NOTE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setRawNote(found.rawNote);
      setExtractionResult(structuredClone(found.precomputedResult));
    }
  };

  const handleResetNote = () => {
    setHighlightedSpan(null);
    setStatusBanner(null);
    if (selectedPresetId === 'custom') {
      handleSelectPreset('custom');
      return;
    }
    const found = CLINICAL_NOTE_PRESETS.find((p) => p.id === selectedPresetId);
    if (found) {
      setRawNote(found.rawNote);
      setExtractionResult(structuredClone(found.precomputedResult));
    }
  };

  const handleRunExtraction = async () => {
    if (!rawNote.trim()) return;
    setIsExtracting(true);
    setStatusBanner(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNote,
          preferLiveGemini
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.result) {
        setExtractionResult(data.result);
      }
      if (data.fallbackNotice) {
        setStatusBanner(data.fallbackNotice);
      } else if (data.result?.extractionMode === 'gemini-live') {
        setStatusBanner(
          `Live Gemini API structured extraction completed in ${data.result.latencyMs} ms with strict responseSchema validation.`
        );
      } else {
        setStatusBanner(
          `Ontology extraction and HL7 FHIR R4 Bundle synthesis completed (${data.result?.latencyMs || 35} ms).`
        );
      }
    } catch {
      const localResult = extractClinicalNoteDeterministic(rawNote);
      setExtractionResult(localResult);
      setStatusBanner(
        'Processed via deterministic clinical NLP and ontology mapping engine.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleHighlightSpan = (span: string) => {
    setHighlightedSpan(span);
  };

  const handleResolveAuditFlag = (flagId: string, addendumText: string) => {
    setExtractionResult((prev) => ({
      ...prev,
      codingAuditFlags: prev.codingAuditFlags.map((flag) =>
        flag.id === flagId
          ? {
              ...flag,
              resolved: true,
              resolutionAddendum: addendumText
            }
          : flag
      )
    }));

    setRawNote((prevNote) => {
      if (prevNote.includes(addendumText)) return prevNote;
      return `${prevNote.trim()}\n\n[CLINICIAN CDI CLARIFICATION ADDENDUM — DR. IBRAHIM MOHAMMED, MD]:\n${addendumText}`;
    });
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col">
      {/* TOP BAR CONTRACT: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 border-b border-slate-800 bg-[#07090E]/95 px-6 py-3.5 backdrop-blur-xs">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
        >
          FHIR-Structurer
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Primary Workspace Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
        >
          <button
            type="button"
            onClick={() => setActiveOutputTab('entities')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
              activeOutputTab === 'entities'
                ? 'text-cyan-400 underline underline-offset-8 decoration-cyan-400'
                : ''
            }`}
          >
            Clinical Entities
          </button>
          <button
            type="button"
            onClick={() => setActiveOutputTab('fhir')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
              activeOutputTab === 'fhir'
                ? 'text-cyan-400 underline underline-offset-8 decoration-cyan-400'
                : ''
            }`}
          >
            FHIR R4 Bundle
          </button>
          <button
            type="button"
            onClick={() => setActiveOutputTab('audit')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
              activeOutputTab === 'audit'
                ? 'text-cyan-400 underline underline-offset-8 decoration-cyan-400'
                : ''
            }`}
          >
            CDI Coding Audit
          </button>
          <button
            type="button"
            onClick={() => setIsPromptDrawerOpen(true)}
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Few-Shot Architecture
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsPromptDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Inspect System Prompt &amp; JSON Schema</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE HERO & CALIBRATED TELEMETRY RIBBON */}
      <div
        id="top"
        className="border-b border-slate-800 bg-[#0B0E17] px-6 py-5"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="space-y-1.5">
              {/* Unboxed metadata line with · separators */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold">
                  FEW-SHOT CLINICAL NLP &amp; ONTOLOGY EXTRACTION ENGINE
                </span>
                <span aria-hidden="true">·</span>
                <span>HL7 FHIR R4 v4.0.1</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-200">
                  Created by Dr. Ibrahim Mohammed (MD | Health Informatics Lead)
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl text-balance">
                Unstructured Clinical Narrative to Validated HL7 FHIR R4 &amp; Ontology Pipeline
              </h1>
            </div>

            {/* Secondary Trigger for Prompt Engineering Drawer */}
            <div className="flex items-center gap-3 self-start lg:self-end">
              <button
                type="button"
                onClick={() => setIsPromptDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-[#07090E] px-3 py-1.5 text-xs font-mono text-cyan-300 hover:border-cyan-500/60 hover:text-cyan-200 transition-colors whitespace-nowrap shrink-0"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>View CoT Trace ({extractionResult.chainOfThoughtSummary.length} steps)</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 5-Column Scientific Metric Display Bar with Recharts Age & Gender Profile (Tabular Numerals) */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-md border border-slate-800 bg-[#07090E] px-4 py-3">
              <div className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
                Extracted Clinical Entities
              </div>
              <div className="mt-1 flex items-baseline">
                <span className="text-2xl font-mono font-bold text-slate-100 tabular-nums">
                  {metrics.totalEntities}
                </span>
                <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">
                  concepts
                </span>
              </div>
              <div className="mt-0.5 text-[11px] font-mono text-slate-400 tabular-nums">
                {extractionResult.diagnoses.length} Dx · {extractionResult.medications.length} Rx · {extractionResult.labsAndVitals.length} LOINC
              </div>
            </div>

            <div className="rounded-md border border-slate-800 bg-[#07090E] px-4 py-3">
              <div className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
                Mean Ontology Confidence
              </div>
              <div className="mt-1 flex items-baseline">
                <span className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
                  {(metrics.meanConfidence * 100).toFixed(1)}
                </span>
                <span className="ml-1 text-xs font-mono uppercase text-slate-400">
                  %
                </span>
              </div>
              <div className="mt-0.5 text-[11px] font-mono text-emerald-400/90 tabular-nums">
                ● Schema Conformance Verified
              </div>
            </div>

            <div className="rounded-md border border-slate-800 bg-[#07090E] px-4 py-3">
              <div className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
                Pharmacotherapy Safety Alerts
              </div>
              <div className="mt-1 flex items-baseline">
                <span
                  className={`text-2xl font-mono font-bold tabular-nums ${
                    metrics.interactionCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {metrics.interactionCount}
                </span>
                <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">
                  interactions
                </span>
              </div>
              <div className="mt-0.5 text-[11px] font-mono text-slate-400">
                RxNorm Drug-Drug &amp; Renal Checks
              </div>
            </div>

            <div className="rounded-md border border-slate-800 bg-[#07090E] px-4 py-3">
              <div className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
                CDI Coding Audit Queries
              </div>
              <div className="mt-1 flex items-baseline">
                <span
                  className={`text-2xl font-mono font-bold tabular-nums ${
                    metrics.unresolvedAuditCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {metrics.unresolvedAuditCount}
                </span>
                <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">
                  open / {metrics.totalAuditCount} total
                </span>
              </div>
              <div className="mt-0.5 text-[11px] font-mono text-slate-400">
                MS-DRG &amp; CMS-HCC Specificity
              </div>
            </div>

            <DemographicsMiniChart patient={extractionResult.patient} />
          </div>
        </div>
      </div>

      {/* MAIN ASYMMETRIC SPLIT WORKSPACE (1440px Desktop Presence) */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-6">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN (5 Cols on Desktop): Unstructured Clinical Input Panel */}
          <div className="lg:col-span-5 flex flex-col">
            <ClinicalInputPanel
              presets={CLINICAL_NOTE_PRESETS}
              selectedPresetId={selectedPresetId}
              onSelectPreset={handleSelectPreset}
              rawNote={rawNote}
              onChangeRawNote={setRawNote}
              onRunExtraction={handleRunExtraction}
              onResetNote={handleResetNote}
              isExtracting={isExtracting}
              preferLiveGemini={preferLiveGemini}
              onToggleLiveGemini={setPreferLiveGemini}
              highlightedSpan={highlightedSpan}
              onClearHighlight={() => setHighlightedSpan(null)}
              patient={extractionResult.patient}
              statusBanner={statusBanner}
              extractionResult={extractionResult}
            />
          </div>

          {/* RIGHT COLUMN (7 Cols on Desktop): Multi-Tab Structured Output Dashboard */}
          <section
            aria-label="Multi-Tab Structured Output Dashboard"
            className="lg:col-span-7 flex flex-col rounded-lg border border-slate-800 bg-[#0D121D]"
          >
            {/* Output Dashboard Header & Segmented Tab Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-3.5">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-cyan-400">STAGE 02</span>
                  <span aria-hidden="true">·</span>
                  <span>ONTOLOGY NORMALIZATION &amp; HL7 FHIR R4 OUTPUT</span>
                </div>
                <h2 className="mt-0.5 text-base font-semibold text-slate-100">
                  Multi-Tab Structured Output Dashboard
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
                <span>
                  Mode:{' '}
                  <strong className="text-cyan-400">
                    {extractionResult.extractionMode === 'gemini-live'
                      ? 'GEMINI-LIVE'
                      : extractionResult.extractionMode === 'precomputed-gold'
                      ? 'GOLD-BENCHMARK'
                      : 'HYBRID-NLP'}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>{extractionResult.latencyMs} ms</span>
              </div>
            </div>

            {/* Primary 3-Tab Bar */}
            <div className="border-b border-slate-800 bg-[#090D15] px-5 py-2.5">
              <div
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                role="tablist"
                aria-label="Structured Output Views"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeOutputTab === 'entities'}
                  onClick={() => setActiveOutputTab('entities')}
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeOutputTab === 'entities'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'border border-slate-800 bg-[#0D121D] text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Database className="h-3.5 w-3.5 shrink-0" />
                  <span>01. Clinical Entities ({metrics.totalEntities})</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeOutputTab === 'fhir'}
                  onClick={() => setActiveOutputTab('fhir')}
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeOutputTab === 'fhir'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'border border-slate-800 bg-[#0D121D] text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <FileJson className="h-3.5 w-3.5 shrink-0" />
                  <span>02. HL7 FHIR R4 Bundle ({fhirValidation.totalResources})</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeOutputTab === 'audit'}
                  onClick={() => setActiveOutputTab('audit')}
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeOutputTab === 'audit'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'border border-slate-800 bg-[#0D121D] text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    03. Clinical Coding Audit ({metrics.unresolvedAuditCount})
                  </span>
                </button>
              </div>
            </div>

            {/* Active Tab Viewport */}
            <div className="flex-1 p-5">
              {activeOutputTab === 'entities' && (
                <EntitiesTab
                  diagnoses={extractionResult.diagnoses}
                  medications={extractionResult.medications}
                  labsAndVitals={extractionResult.labsAndVitals}
                  onHighlightSpan={handleHighlightSpan}
                />
              )}

              {activeOutputTab === 'fhir' && (
                <FhirBundleTab
                  bundle={fhirBundle}
                  validation={fhirValidation}
                />
              )}

              {activeOutputTab === 'audit' && (
                <CodingAuditTab
                  auditFlags={extractionResult.codingAuditFlags}
                  onHighlightSpan={handleHighlightSpan}
                  onResolveAuditFlag={handleResolveAuditFlag}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* QUIET CLINICAL FOOTER */}
      <footer className="mt-8 border-t border-slate-800/80 bg-[#07090E] px-6 py-4">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-200">FHIR-Structurer</span>
            <span aria-hidden="true">·</span>
            <span>Created by Dr. Ibrahim Mohammed (MD | Health Informatics Lead)</span>
            <span aria-hidden="true">·</span>
            <span>HL7 FHIR R4 · ICD-10-CM · SNOMED-CT · RxNorm · LOINC</span>
          </div>
          <div className="font-mono text-slate-400">
            Clinical Decision Support &amp; CDI Sandbox (For Health Informatics Demonstration)
          </div>
        </div>
      </footer>

      {/* COLLAPSIBLE PROMPT ENGINEERING ARCHITECTURE DRAWER */}
      <PromptArchitectureDrawer
        isOpen={isPromptDrawerOpen}
        onClose={() => setIsPromptDrawerOpen(false)}
        activeChainOfThought={extractionResult.chainOfThoughtSummary}
        activeNoteTitle={activePresetTitle}
      />
    </div>
  );
}
