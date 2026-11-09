import { ExtractionResult } from '../types/clinical';

export type HeatmapCategory = 'diagnosis' | 'medication' | 'lab-vital' | 'cdi-audit';

export type CertaintyBand = 'ultra-high' | 'high' | 'moderate' | 'low-review';

export interface HeatmapSpanMatch {
  start: number;
  end: number;
  confidence: number;
  category: HeatmapCategory;
  codeLabel: string;
  entityTitle: string;
  sourceEvidenceSpan: string;
  certaintyBand: CertaintyBand;
}

export interface HeatmapToken {
  id: string;
  text: string;
  start: number;
  end: number;
  match: HeatmapSpanMatch | null;
  isFocused: boolean;
}

export function getCertaintyBand(confidence: number, category: HeatmapCategory): CertaintyBand {
  if (category === 'cdi-audit' || confidence < 0.88) {
    return 'low-review';
  }
  if (confidence >= 0.98) {
    return 'ultra-high';
  }
  if (confidence >= 0.94) {
    return 'high';
  }
  return 'moderate';
}

/**
 * Maps an extraction certainty score (0.0 - 1.0) to a distinct background opacity
 * CSS class and border treatment for the clinical note heatmap overlay.
 */
export function getHeatmapOpacityClasses(
  band: CertaintyBand,
  confidence: number,
  isFocused: boolean
): {
  bgClass: string;
  borderClass: string;
  textClass: string;
  opacityPercent: number;
} {
  // Compute explicit visual background opacity percentage scaled by confidence
  const opacityPercent =
    band === 'ultra-high'
      ? 38
      : band === 'high'
      ? 24
      : band === 'moderate'
      ? 16
      : Math.max(12, Math.round(confidence * 28));

  if (isFocused) {
    return {
      bgClass: 'bg-cyan-400/45 ring-1 ring-cyan-300',
      borderClass: 'border-b-2 border-cyan-300',
      textClass: 'text-white font-semibold',
      opacityPercent: 45
    };
  }

  switch (band) {
    case 'ultra-high':
      return {
        bgClass: 'bg-cyan-500/35 hover:bg-cyan-500/45',
        borderClass: 'border-b border-cyan-400',
        textClass: 'text-cyan-50',
        opacityPercent
      };
    case 'high':
      return {
        bgClass: 'bg-cyan-500/20 hover:bg-cyan-500/30',
        borderClass: 'border-b border-cyan-500/70',
        textClass: 'text-slate-100',
        opacityPercent
      };
    case 'moderate':
      return {
        bgClass: 'bg-teal-500/15 hover:bg-teal-500/25',
        borderClass: 'border-b border-teal-400/60',
        textClass: 'text-teal-100',
        opacityPercent
      };
    case 'low-review':
    default:
      return {
        bgClass: 'bg-amber-500/25 hover:bg-amber-500/35',
        borderClass: 'border-b border-dashed border-amber-400',
        textClass: 'text-amber-100',
        opacityPercent
      };
  }
}

/**
 * Tokenizes raw clinical note text into non-overlapping segments annotated with
 * extraction certainty scores, ontology code metadata, and visual opacity bands.
 */
export function tokenizeNoteWithConfidenceHeatmap(
  rawNote: string,
  result: ExtractionResult,
  focusedEvidenceSpan: string | null = null
): HeatmapToken[] {
  if (!rawNote) return [];

  const lowerNote = rawNote.toLowerCase();
  const candidateSpans: HeatmapSpanMatch[] = [];

  const registerSpanFragments = (
    rawSpan: string,
    confidence: number,
    category: HeatmapCategory,
    codeLabel: string,
    entityTitle: string
  ) => {
    if (!rawSpan || !rawSpan.trim()) return;

    // Split composite evidence spans joined by "..." into contiguous fragments
    const fragments = rawSpan
      .split(/\s*\.\.\.\s*/)
      .map((f) => f.trim())
      .filter((f) => f.length >= 3);

    for (const fragment of fragments) {
      const idx = lowerNote.indexOf(fragment.toLowerCase());
      if (idx !== -1) {
        candidateSpans.push({
          start: idx,
          end: idx + fragment.length,
          confidence,
          category,
          codeLabel,
          entityTitle,
          sourceEvidenceSpan: rawSpan,
          certaintyBand: getCertaintyBand(confidence, category)
        });
      }
    }
  };

  for (const dx of result.diagnoses) {
    registerSpanFragments(
      dx.evidenceSpan,
      dx.confidence,
      'diagnosis',
      `ICD-10 ${dx.icd10Code}`,
      dx.clinicalTerm
    );
  }

  for (const med of result.medications) {
    registerSpanFragments(
      med.evidenceSpan,
      med.confidence,
      'medication',
      `RxCUI ${med.rxnormCode}`,
      med.medicationName
    );
  }

  for (const obs of result.labsAndVitals) {
    registerSpanFragments(
      obs.evidenceSpan,
      obs.confidence,
      'lab-vital',
      `LOINC ${obs.loincCode}`,
      `${obs.measurementName} (${obs.value} ${obs.unit})`
    );
  }

  for (const flag of result.codingAuditFlags) {
    if (!flag.resolved) {
      registerSpanFragments(
        flag.ambiguousQuote,
        0.76,
        'cdi-audit',
        'CDI Query',
        flag.issueCategory
      );
    }
  }

  // Sort spans by start index ascending, then by length descending
  candidateSpans.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - b.start - (a.end - a.start);
  });

  // Filter out overlapping spans (keep earliest / longest span)
  const acceptedSpans: HeatmapSpanMatch[] = [];
  let currentEnd = 0;
  for (const span of candidateSpans) {
    if (span.start >= currentEnd) {
      acceptedSpans.push(span);
      currentEnd = span.end;
    }
  }

  // Build lossless token array covering 0..rawNote.length
  const tokens: HeatmapToken[] = [];
  let cursor = 0;

  const isFocusedMatch = (span: HeatmapSpanMatch): boolean => {
    if (!focusedEvidenceSpan) return false;
    const focusLower = focusedEvidenceSpan.toLowerCase();
    const spanLower = span.sourceEvidenceSpan.toLowerCase();
    return spanLower === focusLower || spanLower.includes(focusLower) || focusLower.includes(spanLower);
  };

  for (let i = 0; i < acceptedSpans.length; i++) {
    const span = acceptedSpans[i];
    if (span.start > cursor) {
      tokens.push({
        id: `plain-${cursor}-${span.start}`,
        text: rawNote.slice(cursor, span.start),
        start: cursor,
        end: span.start,
        match: null,
        isFocused: false
      });
    }

    tokens.push({
      id: `heat-${span.start}-${span.end}-${i}`,
      text: rawNote.slice(span.start, span.end),
      start: span.start,
      end: span.end,
      match: span,
      isFocused: isFocusedMatch(span)
    });

    cursor = span.end;
  }

  if (cursor < rawNote.length) {
    tokens.push({
      id: `plain-${cursor}-${rawNote.length}`,
      text: rawNote.slice(cursor),
      start: cursor,
      end: rawNote.length,
      match: null,
      isFocused: false
    });
  }

  return tokens;
}
