import React, { useState, useMemo, useRef } from 'react';
import {
  Play,
  RotateCcw,
  FileText,
  Sparkles,
  SearchCheck,
  X,
  Eye,
  Edit3,
  Layers
} from 'lucide-react';
import {
  ClinicalNotePreset,
  ExtractionResult,
  PatientDemographics
} from '../types/clinical';
import {
  tokenizeNoteWithConfidenceHeatmap,
  getHeatmapOpacityClasses,
  HeatmapSpanMatch,
  CertaintyBand
} from '../utils/heatmapTokenizer';

interface ClinicalInputPanelProps {
  presets: ClinicalNotePreset[];
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  rawNote: string;
  onChangeRawNote: (value: string) => void;
  onRunExtraction: () => void;
  onResetNote: () => void;
  isExtracting: boolean;
  preferLiveGemini: boolean;
  onToggleLiveGemini: (live: boolean) => void;
  highlightedSpan: string | null;
  onClearHighlight: () => void;
  patient: PatientDemographics;
  statusBanner: string | null;
  extractionResult: ExtractionResult;
}

export const ClinicalInputPanel: React.FC<ClinicalInputPanelProps> = ({
  presets,
  selectedPresetId,
  onSelectPreset,
  rawNote,
  onChangeRawNote,
  onRunExtraction,
  onResetNote,
  isExtracting,
  preferLiveGemini,
  onToggleLiveGemini,
  highlightedSpan,
  onClearHighlight,
  patient,
  statusBanner,
  extractionResult
}) => {
  const [heatmapEnabled, setHeatmapEnabled] = useState<boolean>(true);
  const [editorMode, setEditorMode] = useState<'interactive-heatmap' | 'live-editor'>(
    'interactive-heatmap'
  );
  const [bandFilter, setBandFilter] = useState<'all' | CertaintyBand>('all');
  const [selectedMatch, setSelectedMatch] = useState<HeatmapSpanMatch | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = rawNote.length;
  const lineCount = rawNote.split(/\r?\n/).length;

  const tokens = useMemo(
    () =>
      tokenizeNoteWithConfidenceHeatmap(
        rawNote,
        extractionResult,
        highlightedSpan
      ),
    [rawNote, extractionResult, highlightedSpan]
  );

  const bandCounts = useMemo(() => {
    const counts = {
      totalMatched: 0,
      'ultra-high': 0,
      high: 0,
      moderate: 0,
      'low-review': 0
    };
    for (const token of tokens) {
      if (token.match) {
        counts.totalMatched += 1;
        counts[token.match.certaintyBand] += 1;
      }
    }
    return counts;
  }, [tokens]);

  const handleTextareaScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const renderTokenElement = (
    token: (typeof tokens)[number],
    interactive: boolean
  ) => {
    if (!heatmapEnabled || !token.match) {
      return <span key={token.id}>{token.text}</span>;
    }

    if (bandFilter !== 'all' && token.match.certaintyBand !== bandFilter) {
      return (
        <span key={token.id} className="text-slate-500">
          {token.text}
        </span>
      );
    }

    const styles = getHeatmapOpacityClasses(
      token.match.certaintyBand,
      token.match.confidence,
      token.isFocused ||
        (selectedMatch !== null &&
          selectedMatch.start === token.match.start &&
          selectedMatch.end === token.match.end)
    );

    const pct = (token.match.confidence * 100).toFixed(0);

    if (!interactive) {
      return (
        <mark
          key={token.id}
          className={`rounded-xs ${styles.bgClass} ${styles.borderClass} text-transparent`}
        >
          {token.text}
        </mark>
      );
    }

    return (
      <mark
        key={token.id}
        role="button"
        tabIndex={0}
        onClick={() => setSelectedMatch(token.match)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedMatch(token.match);
          }
        }}
        title={`${token.match.entityTitle} | ${token.match.codeLabel} | Certainty: ${pct}% (Opacity ${styles.opacityPercent}%)`}
        className={`cursor-pointer rounded-xs px-0.5 transition-colors ${styles.bgClass} ${styles.borderClass} ${styles.textClass}`}
      >
        {token.text}
        <span className="ml-1 inline-block select-none font-mono text-[10px] opacity-85 tabular-nums">
          [{pct}%]
        </span>
      </mark>
    );
  };

  return (
    <section
      aria-label="Unstructured Clinical Input Panel"
      className="flex flex-col rounded-lg border border-slate-800 bg-[#0D121D]"
    >
      {/* Panel Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-3.5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-cyan-400">STAGE 01</span>
            <span aria-hidden="true">·</span>
            <span>UNSTRUCTURED CLINICAL NARRATIVE INPUT</span>
          </div>
          <h2 className="mt-0.5 text-base font-semibold text-slate-100">
            Clinical Documentation &amp; Confidence Heatmap
          </h2>
        </div>

        {/* Engine Mode Selector */}
        <div
          className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#07090E] p-1"
          role="group"
          aria-label="Extraction Engine Mode"
        >
          <button
            type="button"
            onClick={() => onToggleLiveGemini(false)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              !preferLiveGemini
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gold Benchmark
          </button>
          <button
            type="button"
            onClick={() => onToggleLiveGemini(true)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              preferLiveGemini
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Live Gemini API</span>
          </button>
        </div>
      </div>

      {/* 4 Pre-Loaded Clinical Notes + Custom Editor Selector */}
      <div className="border-b border-slate-800 bg-[#090D15] px-5 py-3">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>Select Pre-Loaded Clinical Note or Custom Free-Text Encounter:</span>
          <span className="font-mono tabular-nums">4 Demo Encounters + Custom Editor</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {presets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedMatch(null);
                  onSelectPreset(preset.id);
                }}
                className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? 'border-cyan-500/60 bg-cyan-500/10 text-slate-100'
                    : 'border-slate-800/90 bg-[#0D121D] text-slate-300 hover:border-slate-700 hover:text-slate-100'
                }`}
              >
                <span className="text-xs font-semibold whitespace-nowrap shrink-0">
                  {preset.shortLabel}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {preset.setting.split('·')[0].trim()}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setSelectedMatch(null);
              setEditorMode('live-editor');
              onSelectPreset('custom');
            }}
            className={`sm:col-span-2 flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition-colors ${
              selectedPresetId === 'custom'
                ? 'border-cyan-500/60 bg-cyan-500/10 text-slate-100'
                : 'border-slate-800/90 bg-[#0D121D] text-slate-300 hover:border-slate-700 hover:text-slate-100'
            }`}
          >
            <span className="text-xs font-semibold whitespace-nowrap shrink-0">
              05. Custom Clinical Note Editor
            </span>
            <span className="text-[11px] font-mono text-slate-400 truncate">
              Paste or edit custom clinical narrative
            </span>
          </button>
        </div>
      </div>

      {/* Patient Demographics Context Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-[#0B0E17] px-5 py-2.5 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-100">{patient.name}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono tabular-nums text-slate-400">MRN {patient.mrn}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono tabular-nums text-slate-400">
            {patient.age}yo {patient.sex.toUpperCase()}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-cyan-400 font-mono">{patient.encounterClassCode}</span>
        </div>
        <div className="text-xs text-slate-400 truncate">
          {patient.attendingClinician}
        </div>
      </div>

      {/* CONFIDENCE HEATMAP OVERLAY CALIBRATION LEGEND & CONTROLS */}
      <div
        data-testid="confidence-heatmap-controls"
        className="border-b border-slate-800 bg-[#080B12] px-5 py-3 space-y-2.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <Layers className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-200">
              Extraction Certainty Heatmap Overlay
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-slate-400 tabular-nums">
              {bandCounts.totalMatched} anchored spans
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHeatmapEnabled((v) => !v)}
              aria-pressed={heatmapEnabled}
              className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                heatmapEnabled
                  ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>{heatmapEnabled ? 'Heatmap Active' : 'Heatmap Hidden'}</span>
            </button>

            <div
              className="flex items-center gap-1 rounded border border-slate-800 bg-[#0D121D] p-0.5"
              role="group"
              aria-label="Clinical Note Display Mode"
            >
              <button
                type="button"
                onClick={() => setEditorMode('interactive-heatmap')}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  editorMode === 'interactive-heatmap'
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Inspect Spans
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('live-editor')}
                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  editorMode === 'live-editor'
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="h-3 w-3" />
                <span>Edit Text</span>
              </button>
            </div>
          </div>
        </div>

        {/* Discrete Opacity Step Legend (Interactive Filter Buttons) */}
        <div
          className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono tabular-nums"
          role="group"
          aria-label="Filter heatmap by extraction certainty score band"
        >
          <button
            type="button"
            onClick={() => setBandFilter('all')}
            className={`rounded border px-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
              bandFilter === 'all'
                ? 'border-slate-500 bg-slate-800 text-white font-semibold'
                : 'border-slate-800 bg-[#0D121D] text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({bandCounts.totalMatched})
          </button>

          <button
            type="button"
            onClick={() =>
              setBandFilter((b) => (b === 'ultra-high' ? 'all' : 'ultra-high'))
            }
            className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
              bandFilter === 'ultra-high'
                ? 'border-cyan-400 bg-cyan-500/35 text-white font-semibold'
                : 'border-cyan-500/40 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30'
            }`}
          >
            <span className="h-2 w-2 rounded-xs bg-cyan-400/90" />
            <span>98-100% · 38% Opacity ({bandCounts['ultra-high']})</span>
          </button>

          <button
            type="button"
            onClick={() => setBandFilter((b) => (b === 'high' ? 'all' : 'high'))}
            className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
              bandFilter === 'high'
                ? 'border-cyan-400 bg-cyan-500/25 text-white font-semibold'
                : 'border-cyan-500/30 bg-cyan-500/10 text-slate-200 hover:bg-cyan-500/20'
            }`}
          >
            <span className="h-2 w-2 rounded-xs bg-cyan-400/55" />
            <span>94-97% · 24% Opacity ({bandCounts.high})</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setBandFilter((b) => (b === 'moderate' ? 'all' : 'moderate'))
            }
            className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
              bandFilter === 'moderate'
                ? 'border-teal-400 bg-teal-500/25 text-white font-semibold'
                : 'border-teal-500/30 bg-teal-500/10 text-teal-200 hover:bg-teal-500/20'
            }`}
          >
            <span className="h-2 w-2 rounded-xs bg-teal-400/45" />
            <span>88-93% · 16% Opacity ({bandCounts.moderate})</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setBandFilter((b) => (b === 'low-review' ? 'all' : 'low-review'))
            }
            className={`inline-flex items-center gap-1.5 rounded border border-dashed px-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
              bandFilter === 'low-review'
                ? 'border-amber-400 bg-amber-500/35 text-white font-semibold'
                : 'border-amber-500/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
            }`}
          >
            <span className="h-2 w-2 rounded-xs bg-amber-400/75" />
            <span>&lt;88% / CDI Review ({bandCounts['low-review']})</span>
          </button>
        </div>
      </div>

      {/* Selected or Traced Heatmap Span Telemetry Bar */}
      {(highlightedSpan || selectedMatch) && (
        <div className="flex items-start justify-between gap-3 border-b border-cyan-500/30 bg-cyan-950/30 px-5 py-2.5">
          <div className="flex items-start gap-2 text-xs">
            <SearchCheck className="mt-0.5 h-4 w-4 text-cyan-400 shrink-0" />
            {selectedMatch ? (
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs tabular-nums">
                  <span className="font-semibold text-cyan-300">
                    {selectedMatch.codeLabel}
                  </span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-emerald-300 font-semibold">
                    Certainty: {(selectedMatch.confidence * 100).toFixed(1)}%
                  </span>
                  <span aria-hidden="true" className="text-slate-500">·</span>
                  <span className="text-slate-300">
                    {selectedMatch.entityTitle}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300">
                  Span: &ldquo;{selectedMatch.sourceEvidenceSpan}&rdquo;
                </div>
              </div>
            ) : (
              <div>
                <span className="font-semibold text-cyan-300">
                  Anchored Source Evidence Span:{' '}
                </span>
                <span className="font-mono text-slate-100">
                  &ldquo;{highlightedSpan}&rdquo;
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedMatch(null);
              onClearHighlight();
            }}
            aria-label="Clear evidence span highlight"
            className="text-slate-400 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Status / Fallback Banner */}
      {statusBanner && (
        <div className="border-b border-slate-800 bg-slate-900/90 px-5 py-2 text-xs text-amber-300 font-mono">
          {statusBanner}
        </div>
      )}

      {/* Clinical Note Surface (Interactive Heatmap Overlay or Synchronized Live Textarea Editor) */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="clinical-note-editor"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300"
          >
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              {editorMode === 'interactive-heatmap'
                ? 'Confidence Heatmap Overlay (Click any highlighted span to inspect certainty)'
                : 'Unstructured Clinical Note Source (Live Heatmap Backdrop + Editable Textarea)'}
            </span>
          </label>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
            <span>{lineCount} lines</span>
            <span aria-hidden="true">·</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        {editorMode === 'interactive-heatmap' ? (
          <div
            data-testid="confidence-heatmap-overlay"
            className="w-full flex-1 max-h-[480px] overflow-y-auto rounded-md border border-slate-800 bg-[#07090E] p-4 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap"
          >
            {tokens.map((token) => renderTokenElement(token, true))}
          </div>
        ) : (
          <div className="relative w-full flex-1 min-h-[380px] rounded-md border border-slate-800 bg-[#07090E] focus-within:border-cyan-500">
            {/* Synchronized Heatmap Backdrop */}
            <div
              ref={backdropRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-transparent"
            >
              {tokens.map((token) => renderTokenElement(token, false))}
            </div>

            {/* Editable Transparent Textarea */}
            <textarea
              ref={textareaRef}
              id="clinical-note-editor"
              value={rawNote}
              onChange={(e) => onChangeRawNote(e.target.value)}
              onScroll={handleTextareaScroll}
              rows={20}
              spellCheck={false}
              placeholder="Paste or type an unstructured clinical note (H&P, Progress Note, Discharge Summary, or Telehealth Transcript)..."
              className="relative z-10 h-full w-full resize-y bg-transparent p-4 font-mono text-xs leading-relaxed text-slate-100 placeholder-slate-600 focus:outline-none"
            />
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedMatch(null);
              onResetNote();
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-[#07090E] px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Note Text</span>
          </button>

          <button
            type="button"
            onClick={onRunExtraction}
            disabled={isExtracting || !rawNote.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>
              {isExtracting
                ? 'Running Few-Shot Ontology Pipeline...'
                : preferLiveGemini
                ? 'Run Live Gemini Extraction'
                : 'Extract Ontologies & Build FHIR Bundle'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
