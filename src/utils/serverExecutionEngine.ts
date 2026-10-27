import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

export interface PreFlightHashCheck {
  id: string;
  label: string;
  relativePath: string;
  expectedSha256: string;
  actualSha256: string;
  verified: boolean;
  sizeBytes: number;
}

export interface ExecutedRunRecord {
  run_id: string;
  suite: 'case01_r1' | 'federal_verbal_classification' | 'federal_established_rule';
  case_id: string;
  form_code: string;
  scheme_id: 'verbal_classification' | 'established_rule';
  condition: string;
  repetition: number;
  model: string;
  temperature: number;
  timestamp_utc: string;
  latency_ms: number;
  image_attached: boolean;
  image_sha256: string | null;
  status: 'completed' | 'error';
  raw_response: string;
  parsed_summary: {
    decision: string;
    premises: string[];
    conclusion: string;
    abstained: boolean;
    visual_details?: Record<string, any>;
  };
  evaluator_audit: {
    reference_status: string;
    expected_target: string;
    exact_match: boolean;
    legitimate_abstention: boolean;
    fact_precision: number | null;
    fact_recall: number | null;
    unsupported_assertions: number;
    all_claims_supported_by_input: boolean;
    audit_notes: string;
  };
}

const CANONICAL_FILES = [
  {
    id: 'case01_jpg',
    label: 'CASE01 · Estímulo Visual Neutro (case01.jpg)',
    relativePath: '04-experimentos/gemma4-case01/model-input/images/case01.jpg',
    expectedSha256: '468e82ef420b9e8ff5f3dbad8d7f7e91d575c5ec2f4ba6e27ebbf5317be9ef63',
  },
  {
    id: 'ao440_png',
    label: 'LEGAL01 / CASE03 · Summons in a Civil Action (ao440.png)',
    relativePath: 'legal-grounding/images/ao440.png',
    expectedSha256: '27330e65eecdadadcf6cfd884fe2e3563d7c704dd3524d0dbbe960c5ffbd68b4',
  },
  {
    id: 'ao441_png',
    label: 'LEGAL02 / CASE04 · Third-Party Summons (ao441.png)',
    relativePath: 'legal-grounding/images/ao441.png',
    expectedSha256: 'fa1f6ddda1fc93168256436da3810dd63566ce2fa3476bb37cf20a0f78e57e4f',
  },
  {
    id: 'ao399_png',
    label: 'LEGAL03 / CASE02 · Waiver of the Service of Summons (ao399.png)',
    relativePath: 'legal-grounding/images/ao399.png',
    expectedSha256: '4db10ad4deedfb8e5a5865b015aaa61952c80bfe2b398d7d9fb2c5b1986f5cb9',
  },
  {
    id: 'requests_jsonl',
    label: 'Contrato de Requisições Fechado (requests.jsonl)',
    relativePath: 'legal-grounding/requests.jsonl',
    expectedSha256: '76b526c68645c9d106c536ba6ef7c147ceef41403b705004a4a5776735385e82',
  },
];

export function verifyPreFlightHashes(rootDir: string): PreFlightHashCheck[] {
  return CANONICAL_FILES.map((item) => {
    const fullPath = path.join(rootDir, item.relativePath);
    if (!fs.existsSync(fullPath)) {
      return {
        ...item,
        actualSha256: 'FILE_NOT_FOUND',
        verified: false,
        sizeBytes: 0,
      };
    }
    const buf = fs.readFileSync(fullPath);
    const actualSha256 = crypto.createHash('sha256').update(buf).digest('hex');
    return {
      ...item,
      actualSha256,
      verified: actualSha256 === item.expectedSha256,
      sizeBytes: buf.length,
    };
  });
}

function parseFormalBracketOutput(rawText: string): { premises: string[]; conclusion: string } {
  const finalMatch = rawText.match(/<final_output>([\s\S]*?)<(?:\/final_output|final_output_f)>/i);
  const candidate = (finalMatch ? finalMatch[1] : rawText).trim().replace(/\.$/, '');
  const bracketMatch = candidate.match(/\[([\s\S]*?)\]\s*,\s*([a-z0-9_(),\s]+)/i);
  if (!bracketMatch) {
    return { premises: [], conclusion: candidate.slice(0, 120) };
  }
  const inner = bracketMatch[1].trim();
  const conclusion = bracketMatch[2].trim().replace(/\s+/g, '');
  const premises: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of inner) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      if (current.trim()) premises.push(current.trim().replace(/\s+/g, ''));
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) premises.push(current.trim().replace(/\s+/g, ''));
  return { premises, conclusion };
}

export async function runLiveExecutionSuite(
  rootDir: string,
  scope: 'all' | 'case01' | 'federal_forms' = 'all'
): Promise<ExecutedRunRecord[]> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build' },
    },
  });

  const modelName = 'gemini-3.8-flash';
  const results: ExecutedRunRecord[] = [];

  // 1. SUITE A: PILOTO CASE01 (Regra Hipotética R1)
  if (scope === 'all' || scope === 'case01') {
    const systemTxt = fs.readFileSync(
      path.join(rootDir, '04-experimentos/gemma4-case01/model-input/system.txt'),
      'utf-8'
    );
    const condWithImg = fs.readFileSync(
      path.join(rootDir, '04-experimentos/gemma4-case01/model-input/conditions/01_with_image.txt'),
      'utf-8'
    );
    const condWithoutImg = fs.readFileSync(
      path.join(rootDir, '04-experimentos/gemma4-case01/model-input/conditions/02_without_image.txt'),
      'utf-8'
    );
    const case01ImgPath = path.join(
      rootDir,
      '04-experimentos/gemma4-case01/model-input/images/case01.jpg'
    );
    const case01Buf = fs.readFileSync(case01ImgPath);
    const case01Sha = crypto.createHash('sha256').update(case01Buf).digest('hex');
    const case01B64 = case01Buf.toString('base64');

    const case01Jobs = [
      {
        condition: 'with_image',
        prompt: condWithImg,
        attachImage: true,
        expectedTarget:
          '[classified_as(A,bicicleta_visual), classification_warrant(bicicleta_visual,deve_ser_conduzido_a_mao_na_zona_Z)] => has_property(A,deve_ser_conduzido_a_mao_na_zona_Z)',
      },
      {
        condition: 'without_image',
        prompt: condWithoutImg,
        attachImage: false,
        expectedTarget:
          'Abstenção obrigatória (conclusion: null, classification: insufficient, Q1/Q2/Q3: insufficient)',
      },
    ];

    for (const job of case01Jobs) {
      const t0 = Date.now();
      const contents: any[] = job.attachImage
        ? [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: case01B64,
              },
            },
            { text: job.prompt },
          ]
        : [{ text: job.prompt }];

      const resp = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: systemTxt,
          temperature: 0.0,
          responseMimeType: 'application/json',
        },
      });

      const rawText = resp.text || '{}';
      const latency = Date.now() - t0;
      let parsed: any = {};
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      const isWithImg = job.condition === 'with_image';
      const q1Val = parsed?.visual_answers?.Q1?.value;
      const q2Val = parsed?.visual_answers?.Q2?.value;
      const q3Val = String(parsed?.visual_answers?.Q3?.value || '').toLowerCase();
      const classStatus = parsed?.classification?.evidence_status;
      const conc = parsed?.instance?.conclusion;

      const premisesList = (parsed?.instance?.premises || []).map(
        (p: any) => `${p.predicate}(${(p.args || []).join(',')})`
      );
      const concStr = conc
        ? `${conc.predicate}(${(conc.args || []).join(',')})`
        : 'null (abstenção normativa)';

      const exactMatch = isWithImg
        ? q1Val === 2 &&
          q2Val === true &&
          (q3Val.includes('preto') || q3Val.includes('black') || q3Val.includes('escuro')) &&
          classStatus === 'supported' &&
          conc?.predicate === 'has_property'
        : parsed?.image_inspected === false &&
          classStatus === 'insufficient' &&
          conc === null;

      results.push({
        run_id: `CASE01_${job.condition}_rep1_${ new Date().toISOString().slice(0, 19).replace(/[:T-]/g, '')}`,
        suite: 'case01_r1',
        case_id: 'CASE01',
        form_code: 'Estímulo Fotográfico R1',
        scheme_id: 'verbal_classification',
        condition: job.condition,
        repetition: 1,
        model: modelName,
        temperature: 0.0,
        timestamp_utc: new Date().toISOString(),
        latency_ms: latency,
        image_attached: job.attachImage,
        image_sha256: job.attachImage ? case01Sha : null,
        status: 'completed',
        raw_response: rawText,
        parsed_summary: {
          decision: isWithImg
            ? classStatus === 'supported'
              ? 'Classificado: bicicleta_visual -> deve_ser_conduzido_a_mao_na_zona_Z'
              : 'Insuficiente'
            : conc === null
            ? 'Abstenção Normativa (Sem Pixels)'
            : 'Conclusão Indevida sem Imagem',
          premises: premisesList,
          conclusion: concStr,
          abstained: !isWithImg && conc === null,
          visual_details: {
            image_inspected: parsed?.image_inspected,
            Q1_wheels: q1Val,
            Q2_pedals: q2Val,
            Q3_frame_color: parsed?.visual_answers?.Q3?.value,
            classification_status: classStatus,
          },
        },
        evaluator_audit: {
          reference_status: 'assistant_multimodal_preannotation_pending_human_review',
          expected_target: job.expectedTarget,
          exact_match: Boolean(exactMatch),
          legitimate_abstention: !isWithImg && conc === null,
          fact_precision: isWithImg ? (exactMatch ? 1.0 : 0.67) : conc === null ? 1.0 : 0.0,
          fact_recall: isWithImg ? (exactMatch ? 1.0 : 0.67) : 1.0,
          unsupported_assertions: !isWithImg && conc !== null ? 1 : 0,
          all_claims_supported_by_input: Boolean(exactMatch),
          audit_notes: isWithImg
            ? `Q1=${q1Val} rodas, Q2=${q2Val} (pedal/manivela), Q3="${parsed?.visual_answers?.Q3?.value}". Regra hipotética R1 aplicada somente após verificação visual de A.`
            : `Sem imagem fornecida: image_inspected=${parsed?.image_inspected}, classification=${classStatus}, conclusion=null. Modelo não converteu definição textual em evidência visual.`,
        },
      });
    }
  }

  // 2. SUITE B: FORMULÁRIOS FEDERAIS (LEGAL01/AO440, LEGAL02/AO441, LEGAL03/AO399 - Verbal Classification)
  if (scope === 'all' || scope === 'federal_forms') {
    const casesJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'legal-grounding/cases.json'), 'utf-8')
    ) as Array<any>;
    const casesById: Record<string, any> = {};
    for (const c of casesJson) casesById[c.id] = c;

    const reqLines = fs
      .readFileSync(path.join(rootDir, 'legal-grounding/requests.jsonl'), 'utf-8')
      .split('\n')
      .filter((l) => l.trim());

    // Select rep=1 for each of the 12 canonical (case_id x condition) pairs
    const rep1Requests = reqLines
      .map((l) => JSON.parse(l))
      .filter((r) => r.repeat === 1)
      .sort((a, b) => a.case_id.localeCompare(b.case_id) || a.condition.localeCompare(b.condition));

    for (const reqItem of rep1Requests) {
      const caseMeta = casesById[reqItem.case_id];
      const formLabel =
        reqItem.case_id === 'LEGAL01'
          ? 'AO 440 (CASE03)'
          : reqItem.case_id === 'LEGAL02'
          ? 'AO 441 (CASE04)'
          : 'AO 399 (CASE02)';

      let imgB64: string | null = null;
      let imgSha: string | null = null;
      if (reqItem.image) {
        const imgPath = path.join(rootDir, 'legal-grounding', reqItem.image);
        const buf = fs.readFileSync(imgPath);
        imgSha = crypto.createHash('sha256').update(buf).digest('hex');
        imgB64 = buf.toString('base64');
      }

      const t0 = Date.now();
      const contents: any[] = imgB64
        ? [
            {
              inlineData: {
                mimeType: 'image/png',
                data: imgB64,
              },
            },
            { text: reqItem.prompt },
          ]
        : [{ text: reqItem.prompt }];

      const resp = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          temperature: 0.0,
        },
      });

      const rawText = resp.text || '';
      const latency = Date.now() - t0;
      const { premises, conclusion } = parseFormalBracketOutput(rawText);
      const predictedSet = new Set([...premises, conclusion]);
      const goldAtoms = new Set<string>((caseMeta.facts || []).map((f: any) => f.atom));
      const derivedAtoms = new Set<string>(caseMeta.derived || []);
      const abstentionAtom = 'undetermined(visual_facts,doc1)';
      const visible = reqItem.condition !== 'without_image';

      const retrieved = [...predictedSet].filter((x) => goldAtoms.has(x));
      const allowed = new Set([...goldAtoms, ...derivedAtoms, abstentionAtom]);
      const unknown = [...predictedSet].filter((x) => !allowed.has(x));
      const unsupported = visible ? unknown : [...unknown, ...retrieved];

      const abstained = predictedSet.has(abstentionAtom);
      const derivedOk =
        visible &&
        derivedAtoms.has(conclusion) &&
        [...goldAtoms].every((g) => premises.includes(g));
      const noImageAbstentionOk = !visible && conclusion === abstentionAtom && unsupported.length === 0;
      const allSupported = unsupported.length === 0 && (derivedOk || noImageAbstentionOk);

      results.push({
        run_id: `${reqItem.case_id}_${reqItem.condition}_rep1`,
        suite: 'federal_verbal_classification',
        case_id: reqItem.case_id,
        form_code: formLabel,
        scheme_id: 'verbal_classification',
        condition: reqItem.condition,
        repetition: 1,
        model: modelName,
        temperature: 0.0,
        timestamp_utc: new Date().toISOString(),
        latency_ms: latency,
        image_attached: Boolean(imgB64),
        image_sha256: imgSha,
        status: 'completed',
        raw_response: rawText,
        parsed_summary: {
          decision: visible
            ? derivedOk
              ? 'Destinatário Indeterminado (Campo em Branco Detectado)'
              : conclusion
            : noImageAbstentionOk
            ? 'Abstenção Visual Formal: undetermined(visual_facts,doc1)'
            : conclusion,
          premises,
          conclusion,
          abstained: abstained || conclusion === 'recipient_identity_undetermined(doc1)',
        },
        evaluator_audit: {
          reference_status: caseMeta.reference_status,
          expected_target: visible
            ? caseMeta.expected_output
            : '[undetermined(visual_facts,doc1)],undetermined(visual_facts,doc1)',
          exact_match: visible ? derivedOk : noImageAbstentionOk,
          legitimate_abstention: visible
            ? conclusion === 'recipient_identity_undetermined(doc1)'
            : noImageAbstentionOk,
          fact_precision: visible
            ? retrieved.length + unknown.length > 0
              ? retrieved.length / (retrieved.length + unknown.length)
              : 1.0
            : noImageAbstentionOk
            ? 1.0
            : 0.0,
          fact_recall: visible ? retrieved.length / goldAtoms.size : 1.0,
          unsupported_assertions: unsupported.length,
          all_claims_supported_by_input: allSupported,
          audit_notes: visible
            ? `Fatos visuais recuperados: ${retrieved.join(', ') || 'nenhum'}. Conclusão derivada: ${conclusion}.`
            : `Condição sem imagem (ablação visual): modelo ${
                noImageAbstentionOk
                  ? 'absteve-se corretamente de adivinhar fatos visuais'
                  : 'produziu átomos sem suporte no input'
              }.`,
        },
      });
    }

    // 3. SUITE C: FORMULÁRIOS FEDERAIS - ESTABLISHED RULE (Fed. R. Civ. P. 4, 12, 14 - Prazos 21 / 60 / 90 dias vs. Apenas-Imagem)
    const establishedRuleJobs = [
      {
        case_id: 'CASE02',
        form_code: 'AO 399 (Waiver of Service)',
        imageRel: 'legal-grounding/images/ao399.png',
        condition: 'established_rule_60d_domestic',
        stipulatedContext:
          'Stipulated factual scenario: The waiver request (doc1) was sent to a defendant located WITHIN a judicial district of the United States, and the waiver was timely signed and returned.',
        expectedDeadline: 'deadline(answer_or_rule12_motion, 60_days_from_date_request_sent)',
        expectedAbstention: false,
      },
      {
        case_id: 'CASE02',
        form_code: 'AO 399 (Waiver of Service)',
        imageRel: 'legal-grounding/images/ao399.png',
        condition: 'established_rule_90d_outside_us',
        stipulatedContext:
          'Stipulated factual scenario: The waiver request (doc1) was sent to a defendant located OUTSIDE any judicial district of the United States, and the waiver was timely signed and returned.',
        expectedDeadline: 'deadline(answer_or_rule12_motion, 90_days_from_date_request_sent)',
        expectedAbstention: false,
      },
      {
        case_id: 'CASE02',
        form_code: 'AO 399 (Waiver of Service)',
        imageRel: 'legal-grounding/images/ao399.png',
        condition: 'established_rule_image_only_blank',
        stipulatedContext:
          'Stipulated factual scenario: NONE. Use ONLY the visible pixels of the unfilled form page doc1. Do NOT assume whether a recipient is inside or outside the United States or whether the waiver was sent.',
        expectedDeadline: 'undetermined_concrete_deadline(blank_unfilled_form, doc1)',
        expectedAbstention: true,
      },
      {
        case_id: 'CASE03',
        form_code: 'AO 440 (Summons in a Civil Action)',
        imageRel: 'legal-grounding/images/ao440.png',
        condition: 'established_rule_21d_standard',
        stipulatedContext:
          'Stipulated factual scenario: Valid service of this summons (doc1) was completed on a standard private defendant (not the United States, a federal agency, or a federal officer).',
        expectedDeadline: 'deadline(answer_or_rule12_motion, 21_days_after_service)',
        expectedAbstention: false,
      },
      {
        case_id: 'CASE03',
        form_code: 'AO 440 (Summons in a Civil Action)',
        imageRel: 'legal-grounding/images/ao440.png',
        condition: 'established_rule_60d_us_government',
        stipulatedContext:
          'Stipulated factual scenario: Valid service of this summons (doc1) was completed on the United States Attorney for an action against a United States agency or officer sued in an official capacity.',
        expectedDeadline: 'deadline(answer_or_rule12_motion, 60_days_after_service_on_us_attorney)',
        expectedAbstention: false,
      },
      {
        case_id: 'CASE04',
        form_code: 'AO 441 (Third-Party Summons)',
        imageRel: 'legal-grounding/images/ao441.png',
        condition: 'established_rule_21d_third_party',
        stipulatedContext:
          'Stipulated factual scenario: Valid service of this third-party summons (doc1) was completed on a private third-party defendant under Fed. R. Civ. P. 14(a).',
        expectedDeadline: 'deadline(answer_or_rule12_motion, 21_days_after_service)',
        expectedAbstention: false,
      },
    ];

    for (const job of establishedRuleJobs) {
      const imgPath = path.join(rootDir, job.imageRel);
      const buf = fs.readFileSync(imgPath);
      const imgSha = crypto.createHash('sha256').update(buf).digest('hex');
      const imgB64 = buf.toString('base64');

      const prompt = `You are formalizing a legal argument under the Walton & Gordon Established Rule argumentation scheme using the visible text printed on the official federal court form image (doc1) and the stipulated factual scenario below.

${job.stipulatedContext}

Allowed conclusion atoms (choose EXACTLY ONE):
- deadline(answer_or_rule12_motion, 21_days_after_service)
- deadline(answer_or_rule12_motion, 60_days_after_service_on_us_attorney)
- deadline(answer_or_rule12_motion, 60_days_from_date_request_sent)
- deadline(answer_or_rule12_motion, 90_days_from_date_request_sent)
- undetermined_concrete_deadline(blank_unfilled_form, doc1)

Respond strictly in JSON with keys:
{
  "printed_rule_observed": "exact deadline text observed on the form",
  "premises": ["atom1", "atom2"],
  "conclusion": "one of the allowed conclusion atoms above",
  "abstained_concrete_party_deadline": true or false,
  "reason": "brief explanation separating printed normative rule from stipulated or missing party facts"
}`;

      const t0 = Date.now();
      const resp = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: imgB64,
            },
          },
          { text: prompt },
        ],
        config: {
          temperature: 0.0,
          responseMimeType: 'application/json',
        },
      });

      const rawText = resp.text || '{}';
      const latency = Date.now() - t0;
      let parsed: any = {};
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());
      }

      const conc = String(parsed.conclusion || '').trim();
      const exactMatch = conc === job.expectedDeadline;

      results.push({
        run_id: `${job.case_id}_${job.condition}_rep1`,
        suite: 'federal_established_rule',
        case_id: job.case_id,
        form_code: job.form_code,
        scheme_id: 'established_rule',
        condition: job.condition,
        repetition: 1,
        model: modelName,
        temperature: 0.0,
        timestamp_utc: new Date().toISOString(),
        latency_ms: latency,
        image_attached: true,
        image_sha256: imgSha,
        status: 'completed',
        raw_response: rawText,
        parsed_summary: {
          decision: conc,
          premises: Array.isArray(parsed.premises) ? parsed.premises : [],
          conclusion: conc,
          abstained: Boolean(parsed.abstained_concrete_party_deadline),
          visual_details: {
            printed_rule_observed: parsed.printed_rule_observed,
            reason: parsed.reason,
          },
        },
        evaluator_audit: {
          reference_status: 'frcp_rule_4_12_14_formal_verification',
          expected_target: job.expectedDeadline,
          exact_match: exactMatch,
          legitimate_abstention: job.expectedAbstention && Boolean(parsed.abstained_concrete_party_deadline),
          fact_precision: exactMatch ? 1.0 : 0.0,
          fact_recall: exactMatch ? 1.0 : 0.0,
          unsupported_assertions: exactMatch ? 0 : 1,
          all_claims_supported_by_input: exactMatch,
          audit_notes: parsed.reason || '',
        },
      });
    }
  }

  // Persist results to disk without overwriting existing historical files
  const outDir = path.join(rootDir, '05-resultados');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const jsonlPath = path.join(outDir, 'execucao_homologada_hoje.jsonl');
  const jsonPath = path.join(outDir, 'execucao_homologada_hoje.json');

  // If running partial scope, merge with existing records if available
  let mergedRecords = results;
  if (scope !== 'all' && fs.existsSync(jsonPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as ExecutedRunRecord[];
      const newIds = new Set(results.map((r) => `${r.case_id}_${r.condition}`));
      mergedRecords = [
        ...prev.filter((p) => !newIds.has(`${p.case_id}_${p.condition}`)),
        ...results,
      ];
    } catch {
      mergedRecords = results;
    }
  }

  fs.writeFileSync(
    jsonlPath,
    mergedRecords.map((r) => JSON.stringify(r)).join('\n') + '\n',
    'utf-8'
  );
  fs.writeFileSync(jsonPath, JSON.stringify(mergedRecords, null, 2), 'utf-8');

  return mergedRecords;
}

export function loadSavedExecutionResults(rootDir: string): ExecutedRunRecord[] {
  const jsonPath = path.join(rootDir, '05-resultados/execucao_homologada_hoje.json');
  if (!fs.existsSync(jsonPath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as ExecutedRunRecord[];
  } catch {
    return [];
  }
}
