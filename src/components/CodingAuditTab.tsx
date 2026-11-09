import React from 'react';
import { AlertCircle, CheckCircle2, Crosshair, FileCheck2 } from 'lucide-react';
import { ClinicalCodingAuditFlag } from '../types/clinical';

interface CodingAuditTabProps {
  auditFlags: ClinicalCodingAuditFlag[];
  onHighlightSpan: (span: string) => void;
  onResolveAuditFlag: (flagId: string, addendumText: string) => void;
}

export const CodingAuditTab: React.FC<CodingAuditTabProps> = ({
  auditFlags,
  onHighlightSpan,
  onResolveAuditFlag
}) => {
  const unresolvedCount = auditFlags.filter((f) => !f.resolved).length;

  const getSeverityLabel = (severity: ClinicalCodingAuditFlag['severity']) => {
    switch (severity) {
      case 'high-impact-drg':
        return {
          text: '✖ MS-DRG / MCC SPECIFICITY GAP',
          tone: 'text-rose-400'
        };
      case 'medication-safety':
        return {
          text: '✖ PHARMACOTHERAPY & RENAL DOSING AUDIT',
          tone: 'text-rose-400'
        };
      case 'hcc-specificity':
        return {
          text: '▲ CMS-HCC RISK ADJUSTMENT SPECIFICITY',
          tone: 'text-amber-400'
        };
      default:
        return {
          text: '▲ CLINICAL VALIDATION & ICD-10-CM AUDIT',
          tone: 'text-cyan-400'
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Audit Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#07090E] px-4 py-3">
        <div>
          <div className="text-xs font-semibold text-slate-100">
            Automated Clinical Documentation Integrity (CDI) &amp; Coding Audit
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Flags ambiguous, unlinked, or under-specified clinical documentation requiring clinician clarification prior to final claims submission.
          </p>
        </div>
        <div className="font-mono text-xs tabular-nums">
          <span className={unresolvedCount > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
            {unresolvedCount} Open CDI Queries
          </span>
          <span aria-hidden="true" className="mx-2 text-slate-600">·</span>
          <span className="text-slate-400">{auditFlags.length} Total Audited</span>
        </div>
      </div>

      {/* Audit Flag Cards */}
      <div className="space-y-4">
        {auditFlags.map((flag, idx) => {
          const sev = getSeverityLabel(flag.severity);
          const defaultAddendum = `CDI Clarification Addendum (${flag.issueCategory}): Confirmed ${flag.potentialCodeUpgrade}.`;

          return (
            <div
              key={flag.id}
              className="rounded-lg border border-slate-800 bg-[#07090E] p-5 transition-colors"
            >
              {/* Top Row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className={sev.tone}>{sev.text}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-300">Query #0{idx + 1}</span>
                    {flag.resolved && (
                      <>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-emerald-400 font-semibold">● RESOLVED IN NOTE</span>
                      </>
                    )}
                  </div>
                  <h4 className="mt-1 text-sm font-semibold text-slate-100">
                    {flag.issueCategory}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onHighlightSpan(flag.ambiguousQuote)}
                    className="inline-flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Crosshair className="h-3 w-3" />
                    <span>Locate Ambiguous Quote</span>
                  </button>
                </div>
              </div>

              {/* Verbatim Ambiguous Documentation Quote */}
              <div className="mt-3 rounded-md border border-slate-800/90 bg-[#0B0E17] p-3">
                <div className="text-[11px] font-mono text-slate-400">
                  Flagged Verbatim Excerpt in Clinician Note:
                </div>
                <div className="mt-1 font-mono text-xs text-amber-200">
                  &ldquo;{flag.ambiguousQuote}&rdquo;
                </div>
              </div>

              {/* Clinical Observation & Non-Leading Physician Query */}
              <div className="mt-3 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">
                    CDI Clinical &amp; Coding Discrepancy:
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {flag.clinicalObservation}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-cyan-300">
                    AHIMA / ACDIS Physician Clarification Query:
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    &ldquo;{flag.cdiQueryPrompt}&rdquo;
                  </p>
                </div>
              </div>

              {/* Code Upgrade & Financial/Quality Impact Footer */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3.5 text-xs">
                <div className="space-y-0.5 font-mono">
                  <div>
                    <span className="text-slate-500">Target Ontology Upgrade: </span>
                    <span className="text-emerald-400 font-semibold">{flag.potentialCodeUpgrade}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Reimbursement / Quality Impact: </span>
                    <span className="text-slate-300">{flag.financialOrQualityImpact}</span>
                  </div>
                </div>

                {flag.resolved ? (
                  <div className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Addendum Appended to Clinical Note</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onResolveAuditFlag(flag.id, defaultAddendum)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 transition-colors whitespace-nowrap shrink-0"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Insert Clarification Addendum into Note</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {auditFlags.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#07090E] p-6 text-xs text-slate-400">
            <AlertCircle className="h-4 w-4 text-emerald-400" />
            <span>No ambiguous documentation flags detected in this clinical note.</span>
          </div>
        )}
      </div>
    </div>
  );
};
