import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Layers, ShieldCheck } from 'lucide-react';
import {
  SYSTEM_INSTRUCTION_PROMPT,
  FEW_SHOT_PROMPT_EXAMPLES,
  RESPONSE_SCHEMA_JSON_DISPLAY
} from '../data/promptArchitecture';

interface PromptArchitectureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeChainOfThought: string[];
  activeNoteTitle: string;
}

export const PromptArchitectureDrawer: React.FC<PromptArchitectureDrawerProps> = ({
  isOpen,
  onClose,
  activeChainOfThought,
  activeNoteTitle
}) => {
  const [activeSection, setActiveSection] = useState<'system' | 'fewshot' | 'schema'>('system');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getCurrentCopyText = () => {
    if (activeSection === 'system') return SYSTEM_INSTRUCTION_PROMPT;
    if (activeSection === 'fewshot') return FEW_SHOT_PROMPT_EXAMPLES;
    return RESPONSE_SCHEMA_JSON_DISPLAY;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentCopyText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback copy
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-drawer-title"
    >
      <div className="relative flex h-full w-full max-w-4xl flex-col border-l border-slate-800 bg-[#0B0E17] text-slate-100 shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>PROMPT ENGINEERING ARCHITECTURE</span>
              <span aria-hidden="true">·</span>
              <span>GEMINI STRUCTURED OUTPUT PIPELINE</span>
            </div>
            <h2 id="prompt-drawer-title" className="mt-1 text-lg font-semibold tracking-tight text-slate-100">
              System Prompt, Few-Shot CoT &amp; Strict JSON Schema Inspector
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:border-cyan-500/50 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span>{copied ? 'Copied Artifact' : 'Copy Active Spec'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close System Prompt and JSON Schema drawer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Architectural Safeguards Summary Bar */}
        <div className="grid grid-cols-1 gap-4 border-b border-slate-800 bg-[#07090E] px-6 py-3.5 sm:grid-cols-3">
          <div>
            <div className="text-xs font-medium text-slate-400">Anti-Hallucination Constraint</div>
            <div className="mt-0.5 text-xs text-slate-200">
              Mandatory verbatim <code className="text-cyan-300">evidenceSpan</code> substring anchoring
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Biomedical Ontologies Enforced</div>
            <div className="mt-0.5 text-xs font-mono text-slate-200">
              ICD-10-CM · SNOMED-CT · RxNorm · LOINC
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Schema Determinism</div>
            <div className="mt-0.5 text-xs text-slate-200">
              Constrained decoding via <code className="text-cyan-300">responseSchema</code>
            </div>
          </div>
        </div>

        {/* Navigation Tabs inside Drawer */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0B0E17] px-6 py-2.5">
          <div className="flex items-center gap-1 rounded-lg bg-[#07090E] p-1 border border-slate-800/80">
            <button
              type="button"
              onClick={() => setActiveSection('system')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'system'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>01. System Instruction &amp; Rules</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('fewshot')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'fewshot'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>02. Few-Shot Prompt &amp; CoT Trace</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('schema')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'schema'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>03. Strict JSON responseSchema</span>
            </button>
          </div>
          <span className="hidden text-xs font-mono text-slate-400 sm:inline">
            Model: gemini-3.8-flash
          </span>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSection === 'system' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  System Instruction Architecture (config.systemInstruction)
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Injected into the Gemini API call to enforce clinical negation awareness, abbreviation disambiguation, dual-ontology mapping, and AHIMA-compliant CDI query formulation.
                </p>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-[#07090E] p-4 text-xs font-mono leading-relaxed text-slate-200 whitespace-pre-wrap">
                {SYSTEM_INSTRUCTION_PROMPT}
              </pre>
            </div>
          )}

          {activeSection === 'fewshot' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Active Note Chain-of-Thought (CoT) Execution Trace
                  </h3>
                  <span className="text-xs font-mono text-cyan-400">{activeNoteTitle}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Intermediate clinical reasoning steps executed prior to emitting ontology codes and FHIR R4 resources:
                </p>
                <ol className="mt-3 space-y-2 rounded-lg border border-slate-800 bg-[#07090E] p-4">
                  {activeChainOfThought.map((step, index) => (
                    <li key={index} className="flex items-start gap-3 text-xs leading-relaxed text-slate-200">
                      <span className="font-mono font-semibold text-cyan-400 tabular-nums shrink-0">
                        0{index + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Few-Shot In-Context Exemplars (FEW_SHOT_PROMPT_EXAMPLES)
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Domain-calibrated clinical exemplars demonstrating negation filtering, causal combination coding (e.g., E11.22), and CDI query triggers:
                </p>
                <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-[#07090E] p-4 text-xs font-mono leading-relaxed text-slate-200 whitespace-pre-wrap">
                  {FEW_SHOT_PROMPT_EXAMPLES}
                </pre>
              </div>
            </div>
          )}

          {activeSection === 'schema' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Strict @google/genai responseSchema Definition
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Passed via <code className="text-cyan-300">config.responseMimeType = &quot;application/json&quot;</code> and <code className="text-cyan-300">config.responseSchema</code> to guarantee deterministic JSON keys, enum constraints, and non-nullable ontology fields before downstream HL7 FHIR R4 Bundle serialization.
                </p>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-[#07090E] p-4 text-xs font-mono leading-relaxed text-cyan-100/90 whitespace-pre">
                {RESPONSE_SCHEMA_JSON_DISPLAY}
              </pre>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-[#07090E] px-6 py-3.5">
          <div className="text-xs text-slate-400">
            Designed by Dr. Ibrahim Mohammed (MD | Health Informatics Lead)
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            Return to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
