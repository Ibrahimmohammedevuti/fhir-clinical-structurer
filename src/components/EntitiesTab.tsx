import React, { useState } from 'react';
import { Search, AlertTriangle, Crosshair } from 'lucide-react';
import {
  ClinicalDiagnosis,
  ClinicalLabVital,
  ClinicalMedication
} from '../types/clinical';

interface EntitiesTabProps {
  diagnoses: ClinicalDiagnosis[];
  medications: ClinicalMedication[];
  labsAndVitals: ClinicalLabVital[];
  onHighlightSpan: (span: string) => void;
}

export const EntitiesTab: React.FC<EntitiesTabProps> = ({
  diagnoses,
  medications,
  labsAndVitals,
  onHighlightSpan
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'diagnoses' | 'medications' | 'labs'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const q = searchQuery.trim().toLowerCase();

  const filteredDiagnoses = diagnoses.filter(
    (d) =>
      !q ||
      d.clinicalTerm.toLowerCase().includes(q) ||
      d.icd10Code.toLowerCase().includes(q) ||
      d.snomedCode.toLowerCase().includes(q) ||
      d.icd10Display.toLowerCase().includes(q)
  );

  const filteredMedications = medications.filter(
    (m) =>
      !q ||
      m.medicationName.toLowerCase().includes(q) ||
      m.rxnormCode.toLowerCase().includes(q) ||
      m.rxnormDisplay.toLowerCase().includes(q) ||
      (m.interactionWarning &&
        m.interactionWarning.interactingAgent.toLowerCase().includes(q))
  );

  const filteredLabs = labsAndVitals.filter(
    (l) =>
      !q ||
      l.measurementName.toLowerCase().includes(q) ||
      l.loincCode.toLowerCase().includes(q) ||
      l.loincDisplay.toLowerCase().includes(q)
  );

  const formatInterpretation = (interp: ClinicalLabVital['interpretation']) => {
    switch (interp) {
      case 'critical-high':
        return { label: '✖ Critical High', className: 'text-rose-400 font-semibold' };
      case 'critical-low':
        return { label: '✖ Critical Low', className: 'text-rose-400 font-semibold' };
      case 'high':
        return { label: '▲ High', className: 'text-amber-400 font-medium' };
      case 'low':
        return { label: '▼ Low', className: 'text-amber-400 font-medium' };
      default:
        return { label: '● Normal', className: 'text-emerald-400 font-medium' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div
          className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#07090E] p-1"
          role="group"
          aria-label="Filter clinical entity categories"
        >
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Entities ({diagnoses.length + medications.length + labsAndVitals.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('diagnoses')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              categoryFilter === 'diagnoses'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diagnoses · ICD-10 / SNOMED ({diagnoses.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('medications')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              categoryFilter === 'medications'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Medications · RxNorm ({medications.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('labs')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              categoryFilter === 'labs'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Labs &amp; Vitals · LOINC ({labsAndVitals.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[230px] flex-1 sm:max-w-xs">
          <label htmlFor="entity-search" className="sr-only">
            Filter extracted clinical codes or terms
          </label>
          <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            id="entity-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by ICD-10, SNOMED, RxCUI, LOINC..."
            className="w-full rounded-md border border-slate-800 bg-[#07090E] py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* SECTION 1: DIAGNOSES (ICD-10-CM & SNOMED-CT) */}
      {(categoryFilter === 'all' || categoryFilter === 'diagnoses') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              01. Problem List &amp; Diagnoses (ICD-10-CM &amp; SNOMED-CT)
            </h3>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {filteredDiagnoses.length} mapped conditions
            </span>
          </div>

          <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-[#07090E]">
            {filteredDiagnoses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No diagnoses match your current filter query.
              </div>
            ) : (
              filteredDiagnoses.map((dx) => (
                <div key={dx.id} className="p-4 transition-colors hover:bg-slate-900/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-slate-100">
                        {dx.clinicalTerm}
                      </h4>
                      {/* Unboxed metadata with typographic separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                        <span className="text-cyan-400 font-semibold">
                          ICD-10-CM: {dx.icd10Code}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 font-semibold">
                          SNOMED-CT: {dx.snomedCode}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Status: {dx.clinicalStatus.toUpperCase()}</span>
                        <span aria-hidden="true">·</span>
                        <span>Verification: {dx.verificationStatus.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono text-xs tabular-nums">
                        <span className="text-slate-400">Confidence: </span>
                        <span
                          className={`font-semibold ${
                            dx.confidence >= 0.95
                              ? 'text-emerald-400'
                              : dx.confidence >= 0.85
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {(dx.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onHighlightSpan(dx.evidenceSpan)}
                        aria-label={`Locate evidence span for ${dx.clinicalTerm}`}
                        className="inline-flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Crosshair className="h-3 w-3" />
                        <span>Trace Span</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 grid grid-cols-1 gap-2 text-xs text-slate-300 sm:grid-cols-2">
                    <div>
                      <span className="text-slate-500">Official ICD-10-CM Descriptor: </span>
                      <span>{dx.icd10Display}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">SNOMED-CT Fully Specified Name: </span>
                      <span>{dx.snomedDisplay}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-300">CoT Clinical Rationale: </span>
                    <span>{dx.reasoningChain}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: MEDICATIONS (RxNorm & Interaction Warnings) */}
      {(categoryFilter === 'all' || categoryFilter === 'medications') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              02. Pharmacotherapy &amp; Regimen Reconciliation (RxNorm)
            </h3>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {filteredMedications.length} active/reconciled orders
            </span>
          </div>

          <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-[#07090E]">
            {filteredMedications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No medications match your current filter query.
              </div>
            ) : (
              filteredMedications.map((med) => (
                <div key={med.id} className="p-4 transition-colors hover:bg-slate-900/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-slate-100">
                        {med.medicationName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
                        <span className="text-cyan-400 font-semibold">
                          RxNorm RxCUI: {med.rxnormCode}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-200">Dose: {med.dose}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-200">Route: {med.route}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-200">Freq: {med.frequency}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            med.status === 'hold' || med.status === 'discontinued'
                              ? 'text-amber-400 font-semibold'
                              : 'text-emerald-400'
                          }
                        >
                          Order Status: {med.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono text-xs tabular-nums">
                        <span className="text-slate-400">Confidence: </span>
                        <span className="font-semibold text-emerald-400">
                          {(med.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onHighlightSpan(med.evidenceSpan)}
                        aria-label={`Locate evidence span for ${med.medicationName}`}
                        className="inline-flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
                      >
                        <Crosshair className="h-3 w-3" />
                        <span>Trace Span</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-1.5 text-xs text-slate-400">
                    <span className="text-slate-500">Normalized RxNorm Concept: </span>
                    <span className="font-mono text-slate-300">{med.rxnormDisplay}</span>
                  </div>

                  {/* Drug-Drug / Drug-Disease Interaction Warning Box (Hairline border, no border-l-4) */}
                  {med.interactionWarning && (
                    <div
                      className={`mt-3 rounded-md border p-3 text-xs ${
                        med.interactionWarning.severity === 'high'
                          ? 'border-rose-500/40 bg-rose-950/20 text-rose-100'
                          : 'border-amber-500/40 bg-amber-950/20 text-amber-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-mono text-xs">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <AlertTriangle
                            className={`h-3.5 w-3.5 shrink-0 ${
                              med.interactionWarning.severity === 'high'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }`}
                          />
                          <span>
                            {med.interactionWarning.severity === 'high'
                              ? 'HIGH-SEVERITY INTERACTION ALERT'
                              : 'MODERATE INTERACTION ALERT'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{med.interactionWarning.interactingAgent}</span>
                        </div>
                      </div>
                      <p className="mt-1.5 text-slate-200 leading-relaxed">
                        <span className="font-semibold">Mechanism: </span>
                        {med.interactionWarning.clinicalMechanism}
                      </p>
                      <p className="mt-1 text-cyan-300 leading-relaxed">
                        <span className="font-semibold">Clinical Decision Support: </span>
                        {med.interactionWarning.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: LABS & VITALS (LOINC High-Density Data Grid) */}
      {(categoryFilter === 'all' || categoryFilter === 'labs') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              03. Quantitative Laboratories &amp; Vital Signs (LOINC)
            </h3>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {filteredLabs.length} quantitative observations
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#07090E]">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0B0E17] text-slate-400 font-mono">
                  <th className="py-2.5 pl-4 pr-3 font-medium">Observation &amp; LOINC Name</th>
                  <th className="px-3 py-2.5 font-medium">LOINC Code</th>
                  <th className="px-3 py-2.5 text-right font-medium">Measured Value</th>
                  <th className="px-3 py-2.5 font-medium">Reference Interval</th>
                  <th className="px-3 py-2.5 font-medium">Interpretation</th>
                  <th className="px-3 py-2.5 text-right font-medium">Confidence</th>
                  <th className="py-2.5 pl-3 pr-4 text-right font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLabs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      No laboratory or vital sign measurements match your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredLabs.map((obs) => {
                    const interp = formatInterpretation(obs.interpretation);
                    return (
                      <tr
                        key={obs.id}
                        className="transition-colors hover:bg-slate-900/50"
                      >
                        <td className="py-2.5 pl-4 pr-3">
                          <div className="font-semibold text-slate-100">
                            {obs.measurementName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {obs.loincDisplay}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono font-semibold text-cyan-400 tabular-nums whitespace-nowrap">
                          {obs.loincCode}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono tabular-nums whitespace-nowrap">
                          <span className="text-sm font-semibold text-slate-100">
                            {obs.value}
                          </span>
                          <span className="ml-1.5 text-[11px] text-slate-400">
                            {obs.unit}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                          {obs.referenceRange}
                        </td>
                        <td className={`px-3 py-2.5 font-mono whitespace-nowrap ${interp.className}`}>
                          {interp.label}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-emerald-400 tabular-nums whitespace-nowrap">
                          {(obs.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 pl-3 pr-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onHighlightSpan(obs.evidenceSpan)}
                            aria-label={`Trace source span for ${obs.measurementName}`}
                            className="inline-flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors"
                          >
                            <Crosshair className="h-3 w-3" />
                            <span>Span</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
