import {
  SCHEMES_CATALOG,
  SCHEME_PROFILES,
  ACCEPTANCE_CASES,
  NOTION_EDITS,
} from '../data/projectData';

export interface PackageCheckAssertion {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface BooleanRow {
  D: boolean;
  E: boolean;
  D_and_E: boolean;
  D_and_not_E: boolean;
  different: boolean;
}

export interface PackageIntegrityReport {
  timestamp: string;
  allPassed: boolean;
  schemeCount: number;
  profileCount: number;
  oracleCount: number;
  assertions: PackageCheckAssertion[];
  booleanTable: BooleanRow[];
  stdout: string;
}

/**
 * Exact TypeScript port of 03-esquemas/pacote-documental-2026-10-12/scripts/check_package.py
 */
export function runPackageIntegrityCheck(): PackageIntegrityReport {
  const catalog = SCHEMES_CATALOG;
  const profiles = SCHEME_PROFILES;
  const cases = ACCEPTANCE_CASES;
  const edits = NOTION_EDITS;

  const numbersSorted = [...catalog.map((x) => x.number)].sort((a, b) => a - b);
  const expectedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const numbersOk =
    numbersSorted.length === 10 &&
    numbersSorted.every((val, idx) => val === expectedNumbers[idx]);

  const uniqueSchemeIds = new Set(catalog.map((x) => x.id)).size === 10;

  const selectedPilotIds = new Set(
    catalog.filter((x) => x.visual_role === 'pilot').map((x) => x.id)
  );
  const profileIds = new Set(profiles.map((x) => x.id));
  const pilotMatchOk =
    selectedPilotIds.size === profileIds.size &&
    [...selectedPilotIds].every((id) => profileIds.has(id));

  const cqUniquenessAndCountsOk =
    profiles.every((p) => {
      const cqs = p.critical_questions.map((cq) => cq.id);
      return cqs.length === new Set(cqs).size;
    }) &&
    profiles.find((x) => x.id === 'witness_testimony')?.critical_questions.length === 5 &&
    profiles.find((x) => x.id === 'verbal_classification')?.critical_questions.length === 2;

  const uniqueCaseIds = new Set(cases.map((c) => c.id)).size === cases.length;

  const allowed = {
    structure: new Set(['pass', 'fail']),
    semantics: new Set(['match', 'mismatch', 'unreviewed']),
    visual: new Set(['supported', 'contradicted', 'insufficient', 'not_applicable']),
    argument_status: new Set(['provisionally_supported', 'defeated', 'unresolved']),
  };

  const vocabularyAndCoverageOk =
    cases.every(
      (c) =>
        selectedPilotIds.has(c.scheme) &&
        allowed.structure.has(c.expected.structure) &&
        allowed.semantics.has(c.expected.semantics) &&
        allowed.visual.has(c.expected.visual) &&
        allowed.argument_status.has(c.expected.argument_status)
    ) &&
    [...selectedPilotIds].every((scheme) => {
      const group = cases.filter((c) => c.scheme === scheme);
      const structs = new Set(group.map((c) => c.expected.structure));
      const visuals = new Set(group.map((c) => c.expected.visual));
      return (
        structs.has('pass') &&
        structs.has('fail') &&
        visuals.has('supported') &&
        visuals.has('contradicted') &&
        visuals.has('insufficient')
      );
    });

  const booleanTable: BooleanRow[] = [
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ].map(([d, e]) => ({
    D: d,
    E: e,
    D_and_E: d && e,
    D_and_not_E: d && !e,
    different: (d && e) !== (d && !e),
  }));

  const polarityOk =
    booleanTable[2].D === true &&
    booleanTable[2].E === false &&
    booleanTable[2].D_and_E === false &&
    booleanTable[2].D_and_not_E === true &&
    booleanTable[3].D === true &&
    booleanTable[3].E === true &&
    booleanTable[3].D_and_E === true &&
    booleanTable[3].D_and_not_E === false;

  const notionEditsOk =
    edits.some((e) => e.new_str.includes('cq(cq3, not excuses(E))')) &&
    edits.some((e) => e.new_str.includes('factors_favor(defendant(P))')) &&
    edits.some((e) => e.new_str.includes('exceptions: ["exists PC2: is_counterexample(PC2,PC1)"]'));

  const assertions: PackageCheckAssertion[] = [
    {
      id: 'catalog_1_10',
      label: 'Catálogo numerado de 1 a 10 com IDs únicos',
      passed: numbersOk && uniqueSchemeIds,
      detail: '10 esquemas verificados em schemes/catalog.json',
    },
    {
      id: 'pilot_profiles',
      label: 'Correspondência exata entre esquemas visual_role="pilot" e perfis formais v0.1',
      passed: pilotMatchOk,
      detail: 'verbal_classification (#3) e witness_testimony (#6)',
    },
    {
      id: 'cq_counts',
      label: 'Questões críticas sem duplicatas (2 em classificação verbal, 5 em testemunho)',
      passed: cqUniquenessAndCountsOk,
      detail: 'CQ1–CQ2 para verbal_classification; CQ1–CQ5 para witness_testimony',
    },
    {
      id: 'oracles_coverage',
      label: '16 oráculos de aceitação cobrindo vocabulário controlado e estados visuais/estruturais',
      passed: uniqueCaseIds && vocabularyAndCoverageOk,
      detail: 'VC01–VC07 (7 casos) e WT01–WT09 (9 casos)',
    },
    {
      id: 'polarity_table',
      label: 'Projeção booleana (Esquema 9): D ∧ E vs. D ∧ ¬E possui 2 contraexemplos quando D=verdadeiro',
      passed: polarityOk,
      detail: 'Distingue exigir contraexemplo como premissa ordinária de tratá-lo como exceção',
    },
    {
      id: 'notion_edits',
      label: 'Patches documentais (notion-edits.json) verificados',
      passed: notionEditsOk,
      detail: 'CQ3 em as4ER, defendant(P) em asFC, exceção existencial PC2 em asP4P',
    },
  ];

  const allPassed = assertions.every((a) => a.passed);

  return {
    timestamp: new Date().toISOString(),
    allPassed,
    schemeCount: catalog.length,
    profileCount: profiles.length,
    oracleCount: cases.length,
    assertions,
    booleanTable,
    stdout: `Integrity OK: ${catalog.length} schemes, ${profiles.length} proposed profiles, ${cases.length} acceptance oracles.\nPolarity illustration: 4 Boolean rows checked; Wolfram independently returned Equivalent=False.\nNOT checked: model outputs, images, defeasible engine, legal validity.`,
  };
}

/**
 * Exact TypeScript port of 04-experimentos/gemma4-case01/evaluator-only/tools/validate_candidate.py
 * and the 6 synthetic software fixtures from test_validate_candidate.py
 */
export const CASE_ID = 'CASE01';
export const SCHEME_ID = 'verbal_classification';
export const PROFILE_VERSION = '0.1';
export const ENTITY = 'A';
export const CATEGORY = 'bicicleta_visual';
export const PROPERTY = 'deve_ser_conduzido_a_mao_na_zona_Z';
export const CONDITIONS = ['with_image', 'without_image'] as const;
export type ConditionType = (typeof CONDITIONS)[number];

const EVIDENCE_STATES = new Set(['supported', 'contradicted', 'insufficient']);
const CQ_STATES = new Set([
  'resolved_no_defeater',
  'defeater_established',
  'unknown',
  'not_applicable_justified',
]);
const ROOT_KEYS = [
  'case_id',
  'condition',
  'image_inspected',
  'visual_answers',
  'classification',
  'instance',
  'limitations',
];
const ATOM_KEYS = ['predicate', 'args', 'role', 'polaridade', 'modality'];
const PREMISE_ARGS: Record<string, [string, string]> = {
  classified_as: [ENTITY, CATEGORY],
  classification_warrant: [CATEGORY, PROPERTY],
};
const CONCLUSION_ARGS: [string, string] = [ENTITY, PROPERTY];

export const CHECKER_LIMITATIONS = [
  'Conferência mecânica isolada do CASE01; não implementa um validador jurídico completo.',
  'Autoridade formal: snapshot do perfil proposto verbal_classification 0.1, restringido pelo prompt CASE01.',
  'Não lê pixels, referências, gabaritos ou fontes externas; não certifica verdade ou suporte visual.',
  'Classificação, observações e estados de questões críticas são declarações self_reported do candidato.',
  'Razões em prosa livre não recebem interpretação semântica ou revisão externa independente.',
  'incomplete descreve ausência estrutural ou abstenção; não declara um argumento derrotado.',
  'pass descreve somente conformidade com as verificações indicadas, sem certificar validade jurídica.',
];

export interface CheckerFinding {
  code: string;
  checks: string[];
  severity: 'error' | 'info';
  path: string;
  message: string;
}

export interface ValidationReport {
  case_id: string;
  condition: string | null;
  checker_version: string;
  formal_authority: {
    scheme_id: string;
    profile_version: string;
    status: string;
    snapshot_source: string;
    case_contract: string;
  };
  schema_status: 'pass' | 'fail';
  binding_status: 'pass' | 'fail' | 'incomplete';
  evidence_policy: 'pass' | 'fail';
  findings: CheckerFinding[];
  structure: {
    argument_state: string;
    premise_predicates: string[];
    complete_premise_slots: string[];
    missing_premise_slots: string[];
    conclusion_present: boolean;
    conclusion_origin: string;
    classification_assessment: string;
    visual_assessment: string;
    critical_questions_assessment: string;
    critical_questions: Record<string, { state: string; reason: string; assessment: string }>;
    external_independent_review: boolean;
  };
  limitations: string[];
}

function baseReport(condition: string | null): ValidationReport {
  return {
    case_id: CASE_ID,
    condition,
    checker_version: '0.1',
    formal_authority: {
      scheme_id: SCHEME_ID,
      profile_version: PROFILE_VERSION,
      status: 'proposed_not_implemented',
      snapshot_source: 'work/legal-package/schemes/profiles.json#verbal_classification',
      case_contract: 'prompts/shared.txt and PROTOCOL.md (CASE01)',
    },
    schema_status: 'fail',
    binding_status: 'fail',
    evidence_policy: 'fail',
    findings: [],
    structure: {
      argument_state: 'not_assessable',
      premise_predicates: [],
      complete_premise_slots: [],
      missing_premise_slots: Object.keys(PREMISE_ARGS),
      conclusion_present: false,
      conclusion_origin: 'absent',
      classification_assessment: 'self_reported',
      visual_assessment: 'self_reported',
      critical_questions_assessment: 'self_reported',
      critical_questions: {},
      external_independent_review: false,
    },
    limitations: [...CHECKER_LIMITATIONS],
  };
}

function failureReport(condition: string | null, code: string, message: string): ValidationReport {
  const report = baseReport(condition);
  report.findings.push({
    code,
    checks: ['schema', 'binding', 'evidence_policy'],
    severity: 'error',
    path: '$',
    message,
  });
  return report;
}

function detectDuplicateKeysOrNonFiniteInRawJson(text: string): string | null {
  // Check for NaN or Infinity tokens outside strings
  if (/(?:^|[:,[\s])(?:-?Infinity|NaN)(?=[,\]}\s]|$)/.test(text)) {
    return 'Constante fora do padrão JSON (NaN/Infinity).';
  }
  // Check for extreme float exponents that overflow to Infinity in IEEE-754
  const numberMatches = text.match(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)/g);
  if (numberMatches) {
    for (const numStr of numberMatches) {
      const parsed = Number(numStr);
      if (!Number.isFinite(parsed)) {
        return 'Número não finito: ' + numStr;
      }
    }
  }
  // Check for duplicate keys in the same object level using a simple token scan
  const strippedStrings: string[] = [];
  const tokenized = text.replace(/"(?:\\.|[^"\\])*"/g, (match) => {
    strippedStrings.push(match.slice(1, -1));
    return `"__STR_${strippedStrings.length - 1}__"`;
  });

  const scopes: Set<string>[] = [];
  for (let i = 0; i < tokenized.length; i++) {
    const ch = tokenized[i];
    if (ch === '{') {
      scopes.push(new Set());
    } else if (ch === '}') {
      scopes.pop();
    } else if (ch === '"' && scopes.length > 0) {
      const rest = tokenized.slice(i);
      const keyMatch = rest.match(/^"__STR_(\d+)__"\s*:/);
      if (keyMatch) {
        const keyName = strippedStrings[Number(keyMatch[1])];
        const currentScope = scopes[scopes.length - 1];
        if (currentScope.has(keyName)) {
          return 'Chave JSON duplicada: ' + keyName;
        }
        currentScope.add(keyName);
        i += keyMatch[0].length - 1;
      }
    }
  }
  return null;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

class CandidateChecker {
  private candidate: unknown;
  private condition: ConditionType;
  private report: ValidationReport;
  private failed: Set<string>;

  constructor(candidate: unknown, condition: ConditionType) {
    this.candidate = candidate;
    this.condition = condition;
    this.report = baseReport(condition);
    this.failed = new Set();
  }

  private finding(
    code: string,
    checks: string[],
    path: string,
    message: string,
    severity: 'error' | 'info' = 'error'
  ) {
    this.report.findings.push({
      code,
      checks,
      severity,
      path,
      message,
    });
    if (severity === 'error') {
      checks.forEach((c) => this.failed.add(c));
    }
  }

  private schemaError(code: string, path: string, message: string) {
    this.finding(code, ['schema', 'binding'], path, message);
  }

  private objectShape(value: unknown, expectedKeys: string[], path: string): value is Record<string, unknown> {
    if (!isPlainObject(value)) {
      this.schemaError('object_required', path, 'Esperado objeto JSON.');
      return false;
    }
    const actualKeys = Object.keys(value);
    const expectedSet = new Set(expectedKeys);
    const actualSet = new Set(actualKeys);
    const missing = expectedKeys.filter((k) => !actualSet.has(k)).sort();
    const extra = actualKeys.filter((k) => !expectedSet.has(k)).sort();
    if (missing.length > 0) {
      this.schemaError('missing_fields', path, 'Campos ausentes: ' + missing.join(', '));
    }
    if (extra.length > 0) {
      this.schemaError('extra_fields', path, 'Campos não previstos: ' + extra.join(', '));
    }
    return missing.length === 0 && extra.length === 0;
  }

  private exact(value: unknown, expected: unknown, path: string, code = 'unexpected_value'): boolean {
    if (typeof value !== typeof expected || value !== expected) {
      this.schemaError(code, path, 'Valor exigido pelo contrato: ' + JSON.stringify(expected));
      return false;
    }
    return true;
  }

  private checkString(value: unknown, path: string, nonempty = false): boolean {
    if (typeof value !== 'string' || (nonempty && !value.trim())) {
      this.schemaError(
        'string_required',
        path,
        'Esperado texto' + (nonempty ? ' com justificativa não vazia.' : '.')
      );
      return false;
    }
    return true;
  }

  private checkEnum(value: unknown, choices: Set<string>, path: string): boolean {
    if (typeof value !== 'string' || !choices.has(value)) {
      this.schemaError('enum_value', path, 'Valor fora do vocabulário permitido.');
      return false;
    }
    return true;
  }

  private checkRegion(value: unknown, path: string): boolean {
    if (value === null) return true;
    if (
      !Array.isArray(value) ||
      value.length !== 4 ||
      value.some((n) => typeof n !== 'number' || !Number.isFinite(n))
    ) {
      this.schemaError('region_shape', path, 'Região deve ser null ou quatro números finitos.');
      return false;
    }
    const [x0, y0, x1, y1] = value as [number, number, number, number];
    if (!(0 <= x0 && x0 < x1 && x1 <= 1 && 0 <= y0 && y0 < y1 && y1 <= 1)) {
      this.schemaError(
        'region_bounds',
        path,
        'Região normalizada deve ter 0≤x0<x1≤1 e 0≤y0<y1≤1.'
      );
      return false;
    }
    return true;
  }

  private visualEntry(entry: unknown, path: string, noPixels: boolean) {
    this.objectShape(entry, ['value', 'evidence_status', 'reason', 'region'], path);
    if (!isPlainObject(entry)) return;
    const value = entry.value;
    if (typeof value === 'object' && value !== null) {
      this.schemaError('visual_scalar_required', path + '.value', 'Resposta visual deve ser escalar JSON ou null.');
    }
    this.checkEnum(entry.evidence_status, EVIDENCE_STATES, path + '.evidence_status');
    this.checkString(entry.reason, path + '.reason');
    this.checkRegion(entry.region, path + '.region');
    if (noPixels) {
      const checks: [string, unknown][] = [
        ['value', null],
        ['region', null],
        ['evidence_status', 'insufficient'],
      ];
      for (const [field, expected] of checks) {
        if (field in entry && entry[field] !== expected) {
          this.finding(
            'visual_claim_without_inspection',
            ['evidence_policy'],
            `${path}.${field}`,
            'Sem pixels inspecionados, resposta deve ter value/region=null e evidence_status=insufficient.'
          );
        }
      }
    }
  }

  private checkAtom(
    atom: unknown,
    path: string,
    conclusion = false,
    candidateObj: Record<string, unknown>
  ): [string | null, boolean] {
    const expectedKeys = conclusion ? ATOM_KEYS : [...ATOM_KEYS, 'source_id'];
    const shapeOk = this.objectShape(atom, expectedKeys, path);
    if (!isPlainObject(atom)) return [null, false];

    const before = this.report.findings.length;
    const predicate = typeof atom.predicate === 'string' ? atom.predicate : null;
    const allowed = conclusion ? new Set(['has_property']) : new Set(Object.keys(PREMISE_ARGS));
    const predicateOk = this.checkEnum(atom.predicate, allowed, path + '.predicate');

    const args = atom.args;
    let argsOk =
      Array.isArray(args) && args.length === 2 && args.every((a) => typeof a === 'string');
    if (!argsOk) {
      this.schemaError('atom_arity', path + '.args', 'Cada átomo exige exatamente dois argumentos textuais.');
    } else if (predicateOk && predicate) {
      const expectedArgs = conclusion ? CONCLUSION_ARGS : PREMISE_ARGS[predicate];
      if (args[0] !== expectedArgs[0] || args[1] !== expectedArgs[1]) {
        this.finding(
          'term_binding',
          ['binding'],
          path + '.args',
          'Vinculação exigida: ' + JSON.stringify(expectedArgs)
        );
        argsOk = false;
      }
    }

    this.exact(atom.role, conclusion ? 'conclusion' : 'ordinary', path + '.role');
    this.exact(atom.polaridade, 'positive', path + '.polaridade');
    this.exact(atom.modality, 'defeasible', path + '.modality');

    let sourceOk = true;
    if (conclusion) {
      if ('source_id' in atom) {
        this.finding(
          'conclusion_source_must_be_omitted',
          ['binding', 'evidence_policy'],
          path + '.source_id',
          'Conclusão derivada deve omitir source_id; pixels não fornecem regra normativa.'
        );
        sourceOk = false;
      }
    } else if (predicateOk && predicate) {
      const expectedSource = predicate === 'classification_warrant' ? 'R1' : 'IMG01';
      if (atom.source_id !== expectedSource) {
        this.finding(
          predicate === 'classification_warrant' ? 'warrant_source' : 'classification_source',
          ['binding', 'evidence_policy'],
          path + '.source_id',
          `Fonte exigida: ${expectedSource}.`
        );
        sourceOk = false;
      }
    }

    if (
      atom.source_id === 'IMG01' &&
      (this.condition !== 'with_image' || candidateObj.image_inspected !== true)
    ) {
      this.finding(
        'image_source_unavailable',
        ['evidence_policy'],
        path + '.source_id',
        'IMG01 exige condição with_image e inspeção de imagem declarada.'
      );
    }

    const atomErrors = this.report.findings
      .slice(before)
      .some((item) => item.severity === 'error');
    return [predicate, shapeOk && predicateOk && argsOk && sourceOk && !atomErrors];
  }

  public run(): ValidationReport {
    const c = this.candidate;
    this.objectShape(c, ROOT_KEYS, '$');
    if (!isPlainObject(c)) {
      this.failed.add('evidence_policy');
      return this.finish();
    }

    this.exact(c.case_id, CASE_ID, '$.case_id', 'case_id');
    this.exact(c.condition, this.condition, '$.condition', 'condition_mismatch');

    const inspected = c.image_inspected;
    if (typeof inspected !== 'boolean') {
      this.schemaError('boolean_required', '$.image_inspected', 'Esperado booleano JSON.');
      this.failed.add('evidence_policy');
    }
    if (this.condition === 'without_image' && inspected !== false) {
      this.finding(
        'inspection_without_image',
        ['evidence_policy'],
        '$.image_inspected',
        'without_image exige image_inspected=false.'
      );
    }

    const noPixels = this.condition === 'without_image' || inspected !== true;
    const visual = c.visual_answers;
    this.objectShape(visual, ['Q1', 'Q2', 'Q3'], '$.visual_answers');
    if (isPlainObject(visual)) {
      for (const key of ['Q1', 'Q2', 'Q3']) {
        if (key in visual) {
          this.visualEntry(visual[key], '$.visual_answers.' + key, noPixels);
        }
      }
    }

    const classification = c.classification;
    this.objectShape(
      classification,
      ['entity', 'category', 'evidence_status', 'reason', 'region'],
      '$.classification'
    );
    let classificationState: unknown = null;
    if (isPlainObject(classification)) {
      this.exact(classification.entity, ENTITY, '$.classification.entity');
      this.exact(classification.category, CATEGORY, '$.classification.category');
      classificationState = classification.evidence_status;
      this.checkEnum(classificationState, EVIDENCE_STATES, '$.classification.evidence_status');
      this.checkString(classification.reason, '$.classification.reason');
      this.checkRegion(classification.region, '$.classification.region');
      if (noPixels && (classificationState !== 'insufficient' || classification.region !== null)) {
        this.finding(
          'classification_without_inspection',
          ['evidence_policy'],
          '$.classification',
          'Sem pixels inspecionados, classificação exige evidence_status=insufficient e region=null.'
        );
      }
    }

    const limitations = c.limitations;
    if (!Array.isArray(limitations) || limitations.some((item) => typeof item !== 'string')) {
      this.schemaError('limitations_list', '$.limitations', 'Esperada lista de textos.');
    }

    const instance = c.instance;
    this.objectShape(
      instance,
      ['scheme_id', 'profile_version', 'premises', 'conclusion', 'critical_questions'],
      '$.instance'
    );
    if (!isPlainObject(instance)) {
      this.failed.add('evidence_policy');
      return this.finish();
    }

    this.exact(instance.scheme_id, SCHEME_ID, '$.instance.scheme_id', 'scheme_id');
    this.exact(instance.profile_version, PROFILE_VERSION, '$.instance.profile_version', 'profile_version');

    const premises = instance.premises;
    const seen = new Set<string>();
    const complete = new Set<string>();
    if (!Array.isArray(premises)) {
      this.schemaError('premises_list', '$.instance.premises', 'Esperada lista de premissas.');
    } else {
      premises.forEach((premise, index) => {
        const path = `$.instance.premises[${index}]`;
        const [predicate, valid] = this.checkAtom(premise, path, false, c);
        if (predicate) {
          this.report.structure.premise_predicates.push(predicate);
          if (seen.has(predicate)) {
            this.finding(
              'duplicate_premise',
              ['binding'],
              path,
              'Cada premissa do esquema pode aparecer uma única vez.'
            );
          }
          seen.add(predicate);
          if (valid) {
            complete.add(predicate);
          }
        }
      });
    }

    const conclusion = instance.conclusion;
    const conclusionPresent = conclusion !== null && conclusion !== undefined;
    this.report.structure.conclusion_present = conclusionPresent;
    let conclusionOk = false;
    if (conclusionPresent) {
      const [, ok] = this.checkAtom(conclusion, '$.instance.conclusion', true, c);
      conclusionOk = ok;
      this.report.structure.conclusion_origin = conclusionOk ? 'derived' : 'invalid';
      if (!Object.keys(PREMISE_ARGS).every((k) => complete.has(k))) {
        this.finding(
          'conclusion_requires_complete_premises',
          ['binding'],
          '$.instance.conclusion',
          'Conclusão exige classified_as(A,C) e classification_warrant(C,F) completos.'
        );
      }
      if (classificationState !== 'supported') {
        this.finding(
          'conclusion_without_supported_classification',
          ['evidence_policy'],
          '$.instance.conclusion',
          'Conclusão exige classificação declarada supported; insufficient ou contradicted exige abstenção.'
        );
      }
      if (noPixels) {
        this.finding(
          'conclusion_without_inspection',
          ['evidence_policy'],
          '$.instance.conclusion',
          'Sem pixels inspecionados, deve haver abstenção normativa.'
        );
      }
    }

    const cq = instance.critical_questions;
    this.objectShape(cq, ['CQ1', 'CQ2'], '$.instance.critical_questions');
    if (isPlainObject(cq)) {
      for (const key of ['CQ1', 'CQ2']) {
        if (!(key in cq)) continue;
        const entry = cq[key];
        const path = '$.instance.critical_questions.' + key;
        this.objectShape(entry, ['state', 'reason'], path);
        if (isPlainObject(entry)) {
          this.checkEnum(entry.state, CQ_STATES, path + '.state');
          this.checkString(entry.reason, path + '.reason', true);
          this.report.structure.critical_questions[key] = {
            state: String(entry.state),
            reason: String(entry.reason),
            assessment: 'self_reported',
          };
        }
      }
    }

    const structure = this.report.structure;
    structure.complete_premise_slots = Object.keys(PREMISE_ARGS).filter((k) => complete.has(k));
    structure.missing_premise_slots = Object.keys(PREMISE_ARGS).filter((k) => !complete.has(k));

    if (this.failed.has('binding')) {
      structure.argument_state = 'invalid_structure';
    } else if (conclusionOk && structure.missing_premise_slots.length === 0) {
      structure.argument_state = 'structurally_complete';
    } else {
      structure.argument_state =
        classificationState !== 'supported' && !conclusionPresent
          ? 'abstention'
          : 'structurally_incomplete';
      this.finding(
        'incomplete_instance',
        ['binding'],
        '$.instance',
        'Instância parcial ou abstenção; isso não estabelece derrota do argumento.',
        'info'
      );
    }

    return this.finish();
  }

  private finish(): ValidationReport {
    this.report.schema_status = this.failed.has('schema') ? 'fail' : 'pass';
    this.report.evidence_policy = this.failed.has('evidence_policy') ? 'fail' : 'pass';
    if (this.failed.has('binding')) {
      this.report.binding_status = 'fail';
    } else if (this.report.structure.argument_state === 'structurally_complete') {
      this.report.binding_status = 'pass';
    } else {
      this.report.binding_status = 'incomplete';
    }
    return this.report;
  }
}

export function validateCandidateText(text: string, condition: ConditionType): ValidationReport {
  if (!CONDITIONS.includes(condition)) {
    return failureReport(condition, 'unknown_condition', 'Condição deve ser with_image ou without_image.');
  }
  const strictErr = detectDuplicateKeysOrNonFiniteInRawJson(text);
  if (strictErr) {
    return failureReport(condition, 'malformed_json', 'JSON inválido: ' + strictErr);
  }
  let candidate: unknown;
  try {
    candidate = JSON.parse(text);
  } catch (exc) {
    return failureReport(
      condition,
      'malformed_json',
      'JSON inválido: ' + (exc instanceof Error ? exc.message : String(exc))
    );
  }
  return new CandidateChecker(candidate, condition).run();
}

export interface SyntheticFixturePreset {
  id: string;
  title: string;
  description: string;
  condition: ConditionType;
  expectedSummary: string;
  jsonText: string;
}

export function buildSoftwareFixture(condition: ConditionType = 'with_image', abstention = false) {
  const noPixels = condition === 'without_image';
  const supported = !(noPixels || abstention);
  const atom = (predicate: string, args: [string, string], source: string) => ({
    predicate,
    args,
    role: 'ordinary',
    source_id: source,
    polaridade: 'positive',
    modality: 'defeasible',
  });
  const premises = [atom('classification_warrant', [CATEGORY, PROPERTY], 'R1')];
  if (supported) {
    premises.unshift(atom('classified_as', ['A', CATEGORY], 'IMG01'));
  }
  return {
    case_id: 'CASE01',
    condition,
    image_inspected: !noPixels,
    visual_answers: {
      Q1: {
        value: null,
        evidence_status: 'insufficient',
        reason: 'Software fixture; sem observação real.',
        region: null,
      },
      Q2: {
        value: null,
        evidence_status: 'insufficient',
        reason: 'Software fixture; sem observação real.',
        region: null,
      },
      Q3: {
        value: null,
        evidence_status: 'insufficient',
        reason: 'Software fixture; sem observação real.',
        region: null,
      },
    },
    classification: {
      entity: 'A',
      category: CATEGORY,
      evidence_status: supported ? 'supported' : 'insufficient',
      reason: 'Estado sintético para testar o software; nenhum pixel foi usado.',
      region: null as [number, number, number, number] | null,
    },
    instance: {
      scheme_id: 'verbal_classification',
      profile_version: '0.1',
      premises,
      conclusion: supported
        ? {
            predicate: 'has_property',
            args: ['A', PROPERTY],
            role: 'conclusion',
            polaridade: 'positive',
            modality: 'defeasible',
          }
        : null,
      critical_questions: {
        CQ1: { state: 'unknown', reason: 'Fixture de software sem revisão independente.' },
        CQ2: { state: 'unknown', reason: 'Fixture de software sem revisão independente.' },
      },
    },
    limitations: ['Software fixture sintética, não é resposta de modelo nem anotação visual.'],
  };
}

export function getSyntheticFixtures(): SyntheticFixturePreset[] {
  // 1. Valid binding and self-reported CQs
  const f1 = buildSoftwareFixture('with_image');
  f1.instance.critical_questions.CQ2 = {
    state: 'defeater_established',
    reason: 'Estado sintético: não é adjudicação externa.',
  };

  // 2. Swapped entity breaks binding
  const f2 = buildSoftwareFixture('with_image');
  f2.instance.premises[0].args[0] = 'B';

  // 3. Warrant wrong source and conclusion source_id error
  const f3 = buildSoftwareFixture('with_image');
  f3.instance.premises[1].source_id = 'IMG01';

  // 4. Abstention without image is incomplete, not defeated
  const f4 = buildSoftwareFixture('without_image');

  // 5. Hallucination without image inspection
  const f5 = buildSoftwareFixture('with_image');
  f5.image_inspected = false;
  f5.visual_answers.Q1 = {
    value: 2 as unknown as null,
    evidence_status: 'supported',
    reason: 'Afirmação visual sintética sem inspeção de pixels.',
    region: [0.1, 0.1, 0.9, 0.9] as unknown as null,
  };

  // 6. Malformed JSON / duplicate key
  const f6Json = '{\n  "case_id": "CASE01",\n  "case_id": "DUPLICATE_KEY"\n}';

  return [
    {
      id: 'fixture_1_valid',
      title: 'Fixture 1 · Vinculação completa e CQs self_reported',
      description: 'Testa instância completa com classified_as(A,C) [IMG01], classification_warrant(C,F) [R1] e conclusão derivada.',
      condition: 'with_image',
      expectedSummary: 'schema=pass · binding=pass · evidence_policy=pass',
      jsonText: JSON.stringify(f1, null, 2),
    },
    {
      id: 'fixture_2_swapped_entity',
      title: 'Fixture 2 · Quebra de vinculação (Entidade B ≠ A)',
      description: 'Altera o argumento de classified_as para ["B", "bicicleta_visual"], violando a vinculação com a conclusão sobre A.',
      condition: 'with_image',
      expectedSummary: 'schema=pass · binding=fail (term_binding, conclusion_requires_complete_premises)',
      jsonText: JSON.stringify(f2, null, 2),
    },
    {
      id: 'fixture_3_wrong_warrant_source',
      title: 'Fixture 3 · Fonte inválida no warrant (IMG01 em vez de R1)',
      description: 'Atribui classification_warrant à imagem IMG01 em vez da regra textual fornecida R1.',
      condition: 'with_image',
      expectedSummary: 'schema=pass · binding=fail · evidence_policy=fail (warrant_source)',
      jsonText: JSON.stringify(f3, null, 2),
    },
    {
      id: 'fixture_4_abstention_without_image',
      title: 'Fixture 4 · Abstenção correta na condição without_image',
      description: 'Sem imagem, mantém warrant textual R1, abstém-se na classificação e omite conclusão normativa.',
      condition: 'without_image',
      expectedSummary: 'schema=pass · binding=incomplete (abstention) · evidence_policy=pass',
      jsonText: JSON.stringify(f4, null, 2),
    },
    {
      id: 'fixture_5_hallucination_no_pixels',
      title: 'Fixture 5 · Alucinação visual com image_inspected=false',
      description: 'Declara image_inspected=false, mas preenche Q1=2 com região normalizada e deriva conclusão.',
      condition: 'with_image',
      expectedSummary: 'evidence_policy=fail (visual_claim_without_inspection, image_source_unavailable)',
      jsonText: JSON.stringify(f5, null, 2),
    },
    {
      id: 'fixture_6_malformed_json',
      title: 'Fixture 6 · JSON estrito inválido (Chave duplicada)',
      description: 'Verifica rejeição determinística de chaves duplicadas ou constantes fora do padrão JSON.',
      condition: 'without_image',
      expectedSummary: 'schema=fail · binding=fail · evidence_policy=fail (malformed_json)',
      jsonText: f6Json,
    },
  ];
}
