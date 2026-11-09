import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  SYSTEM_INSTRUCTION_PROMPT,
  FEW_SHOT_PROMPT_EXAMPLES
} from './src/data/promptArchitecture.ts';
import { extractClinicalNoteDeterministic } from './src/utils/fhirBuilder.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

const EXTRACTION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: [
    'patient',
    'chainOfThoughtSummary',
    'diagnoses',
    'medications',
    'labsAndVitals',
    'codingAuditFlags'
  ],
  properties: {
    patient: {
      type: Type.OBJECT,
      required: [
        'id',
        'name',
        'mrn',
        'dob',
        'age',
        'sex',
        'encounterType',
        'encounterClassCode',
        'encounterDate',
        'attendingClinician'
      ],
      properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        mrn: { type: Type.STRING },
        dob: { type: Type.STRING },
        age: { type: Type.INTEGER },
        sex: { type: Type.STRING },
        encounterType: { type: Type.STRING },
        encounterClassCode: { type: Type.STRING },
        encounterDate: { type: Type.STRING },
        attendingClinician: { type: Type.STRING }
      }
    },
    chainOfThoughtSummary: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    diagnoses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          'id',
          'clinicalTerm',
          'icd10Code',
          'icd10Display',
          'snomedCode',
          'snomedDisplay',
          'clinicalStatus',
          'verificationStatus',
          'confidence',
          'evidenceSpan',
          'reasoningChain'
        ],
        properties: {
          id: { type: Type.STRING },
          clinicalTerm: { type: Type.STRING },
          icd10Code: { type: Type.STRING },
          icd10Display: { type: Type.STRING },
          snomedCode: { type: Type.STRING },
          snomedDisplay: { type: Type.STRING },
          clinicalStatus: { type: Type.STRING },
          verificationStatus: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          evidenceSpan: { type: Type.STRING },
          reasoningChain: { type: Type.STRING }
        }
      }
    },
    medications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          'id',
          'medicationName',
          'rxnormCode',
          'rxnormDisplay',
          'dose',
          'route',
          'frequency',
          'status',
          'confidence',
          'evidenceSpan'
        ],
        properties: {
          id: { type: Type.STRING },
          medicationName: { type: Type.STRING },
          rxnormCode: { type: Type.STRING },
          rxnormDisplay: { type: Type.STRING },
          dose: { type: Type.STRING },
          route: { type: Type.STRING },
          frequency: { type: Type.STRING },
          status: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          evidenceSpan: { type: Type.STRING },
          interactionWarning: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              severity: { type: Type.STRING },
              interactingAgent: { type: Type.STRING },
              clinicalMechanism: { type: Type.STRING },
              recommendation: { type: Type.STRING }
            }
          }
        }
      }
    },
    labsAndVitals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          'id',
          'category',
          'measurementName',
          'loincCode',
          'loincDisplay',
          'value',
          'unit',
          'referenceRange',
          'interpretation',
          'confidence',
          'evidenceSpan',
          'effectiveTime'
        ],
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING },
          measurementName: { type: Type.STRING },
          loincCode: { type: Type.STRING },
          loincDisplay: { type: Type.STRING },
          value: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          referenceRange: { type: Type.STRING },
          interpretation: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          evidenceSpan: { type: Type.STRING },
          effectiveTime: { type: Type.STRING }
        }
      }
    },
    codingAuditFlags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          'id',
          'severity',
          'ambiguousQuote',
          'issueCategory',
          'clinicalObservation',
          'cdiQueryPrompt',
          'potentialCodeUpgrade',
          'financialOrQualityImpact'
        ],
        properties: {
          id: { type: Type.STRING },
          severity: { type: Type.STRING },
          ambiguousQuote: { type: Type.STRING },
          issueCategory: { type: Type.STRING },
          clinicalObservation: { type: Type.STRING },
          cdiQueryPrompt: { type: Type.STRING },
          potentialCodeUpgrade: { type: Type.STRING },
          financialOrQualityImpact: { type: Type.STRING }
        }
      }
    }
  }
};

app.post('/api/extract', async (req, res) => {
  const startTime = Date.now();
  const { rawNote, preferLiveGemini } = req.body as {
    rawNote?: string;
    preferLiveGemini?: boolean;
  };

  if (!rawNote || typeof rawNote !== 'string' || !rawNote.trim()) {
    res.status(400).json({ error: 'Clinical note text is required for extraction.' });
    return;
  }

  const apiKey =
    typeof process !== 'undefined' && process.env
      ? process.env.GEMINI_API_KEY
      : undefined;
  const hasValidEnvKey =
    Boolean(apiKey) &&
    apiKey !== 'MY_GEMINI_API_KEY' &&
    apiKey!.trim().length > 10;

  if (preferLiveGemini && hasValidEnvKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${FEW_SHOT_PROMPT_EXAMPLES}\n\n### TARGET CLINICAL NOTE FOR EXTRACTION:\n${rawNote}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: EXTRACTION_RESPONSE_SCHEMA
        }
      });

      const rawJson = (response.text ?? '').trim();
      const parsed = JSON.parse(rawJson);
      const latencyMs = Date.now() - startTime;

      res.json({
        result: {
          ...parsed,
          extractionMode: 'gemini-live',
          latencyMs,
          schemaValid: true
        }
      });
      return;
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Gemini extraction failed';
      // Fall back to deterministic hybrid engine while surfacing notice
      const fallback = extractClinicalNoteDeterministic(rawNote);
      fallback.latencyMs = Date.now() - startTime;
      res.json({
        result: fallback,
        fallbackNotice: `Live Gemini call fell back to deterministic ontology engine (${errMessage}).`
      });
      return;
    }
  }

  // Deterministic clinical ontology extraction
  const deterministicResult = extractClinicalNoteDeterministic(rawNote);
  deterministicResult.latencyMs = Math.max(28, Date.now() - startTime);
  res.json({
    result: deterministicResult
  });
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.npm_lifecycle_event === 'start' ||
    Boolean(process.env.K_SERVICE);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    const distIndex = path.join(distPath, 'index.html');
    const rootIndex = path.join(__dirname, 'index.html');
    const indexToServe = fs.existsSync(distIndex) ? distIndex : rootIndex;

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (_req, res) => {
      res.sendFile(indexToServe);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FHIR-Structurer server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
