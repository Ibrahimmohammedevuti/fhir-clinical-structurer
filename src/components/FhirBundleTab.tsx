import React, { useState, useMemo } from 'react';
import { Copy, Check, Download, CheckCircle2 } from 'lucide-react';
import { FhirBundle, FhirValidationSummary } from '../types/clinical';

interface FhirBundleTabProps {
  bundle: FhirBundle;
  validation: FhirValidationSummary;
}

export const FhirBundleTab: React.FC<FhirBundleTabProps> = ({
  bundle,
  validation
}) => {
  const [resourceFilter, setResourceFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  const displayedObject = useMemo(() => {
    if (resourceFilter === 'ALL') return bundle;
    const matchingEntries = bundle.entry.filter(
      (e) => e.resource.resourceType === resourceFilter
    );
    return {
      ...bundle,
      total: matchingEntries.length,
      entry: matchingEntries
    };
  }, [bundle, resourceFilter]);

  const formattedJson = useMemo(
    () => JSON.stringify(displayedObject, null, 2),
    [displayedObject]
  );

  const jsonLines = useMemo(() => formattedJson.split('\n'), [formattedJson]);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: 'application/fhir+json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bundle.id || 'hl7-fhir-r4-bundle'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSyntaxHighlightedLine = (line: string) => {
    // Highlight key-value JSON pairs cleanly without dangerouslySetInnerHTML
    const keyValMatch = line.match(/^(\s*)"([^"]+)"(\s*:\s*)(.*)$/);
    if (!keyValMatch) {
      return <span className="text-slate-400">{line}</span>;
    }

    const [, indent, key, colon, valuePart] = keyValMatch;
    let valueColor = 'text-slate-200';
    if (valuePart.startsWith('"http://') || valuePart.startsWith('"urn:uuid:')) {
      valueColor = 'text-cyan-300';
    } else if (valuePart.startsWith('"')) {
      valueColor = 'text-emerald-300';
    } else if (/^-?\d/.test(valuePart)) {
      valueColor = 'text-amber-300';
    } else if (valuePart.startsWith('true') || valuePart.startsWith('false')) {
      valueColor = 'text-sky-300';
    }

    return (
      <>
        <span>{indent}</span>
        <span className="text-slate-300">&quot;{key}&quot;</span>
        <span className="text-slate-500">{colon}</span>
        <span className={valueColor}>{valuePart}</span>
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* HL7 FHIR R4 Validation Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-[#07090E] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-emerald-400">
            HL7 FHIR R4 v4.0.1 Bundle Validated
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono text-slate-300 tabular-nums">
            {validation.totalResources} Total Resources
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono text-slate-400 tabular-nums">
            ICD-10 ({validation.ontologyCounts.icd10}) / SNOMED ({validation.ontologyCounts.snomed}) / RxNorm ({validation.ontologyCounts.rxnorm}) / LOINC ({validation.ontologyCounts.loinc})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-500/50 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>{copied ? 'Copied FHIR JSON' : 'Copy Bundle JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .json</span>
          </button>
        </div>
      </div>

      {/* Resource Type Filter Bar */}
      <div
        className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-[#07090E] p-1"
        role="group"
        aria-label="Filter FHIR Bundle by resourceType"
      >
        {[
          { key: 'ALL', label: `Full Bundle (${validation.totalResources})` },
          {
            key: 'Condition',
            label: `Condition (${validation.resourceCounts.Condition || 0})`
          },
          {
            key: 'MedicationRequest',
            label: `MedicationRequest (${validation.resourceCounts.MedicationRequest || 0})`
          },
          {
            key: 'Observation',
            label: `Observation (${validation.resourceCounts.Observation || 0})`
          },
          {
            key: 'DetectedIssue',
            label: `DetectedIssue (${validation.resourceCounts.DetectedIssue || 0})`
          },
          {
            key: 'Patient',
            label: `Patient (${validation.resourceCounts.Patient || 0})`
          }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setResourceFilter(tab.key)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
              resourceFilter === tab.key
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Syntax-Highlighted FHIR R4 JSON Code Viewer */}
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#07090E]">
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0B0E17] px-4 py-2 text-xs font-mono text-slate-400">
          <span>application/fhir+json · US Core R4 Profiles</span>
          <span className="tabular-nums">{jsonLines.length} lines</span>
        </div>
        <div className="max-h-[600px] overflow-auto p-4 font-mono text-xs leading-relaxed">
          {jsonLines.map((line, idx) => (
            <div key={idx} className="flex hover:bg-slate-900/60">
              <span className="w-10 select-none pr-3 text-right text-slate-600 tabular-nums shrink-0">
                {idx + 1}
              </span>
              <span className="whitespace-pre">{renderSyntaxHighlightedLine(line)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
