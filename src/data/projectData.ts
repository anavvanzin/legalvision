export interface StatusRow {
  frente: string;
  estado: string;
  evidenciaLimite: string;
  category: 'juridico' | 'software' | 'historico' | 'ambiente';
}

export interface SchemeCatalogItem {
  number: number;
  id: string;
  title: string;
  visual_role: 'pilot' | 'secondary' | 'auxiliary' | 'exclude_initial';
  categories: string[];
  action: string;
  evidence: string;
  executable: boolean;
}

export interface FormalPremise {
  predicate: string;
  args: string[];
  role: 'ordinary' | 'assumption';
  allowed_source: string[];
}

export interface CriticalQuestionSpec {
  id: string;
  target: string[];
  question: string;
}

export interface SchemeProfile {
  id: string;
  source_scheme_number: number;
  adaptation?: string;
  predicates: Record<string, string[]>;
  premises: FormalPremise[];
  conclusion: {
    predicate?: string;
    args?: string[];
    proposition_variable?: string;
    modality: string;
  };
  critical_questions: CriticalQuestionSpec[];
  cq_states: string[];
}

export interface AcceptanceCase {
  id: string;
  scheme: 'verbal_classification' | 'witness_testimony';
  scenario: string;
  expected: {
    structure: 'pass' | 'fail';
    semantics: 'match' | 'mismatch' | 'unreviewed';
    visual: 'supported' | 'contradicted' | 'insufficient' | 'not_applicable';
    argument_status: 'provisionally_supported' | 'defeated' | 'unresolved';
  };
  kind: string;
}

export interface NotionEdit {
  old_str: string;
  new_str: string;
  context_label: string;
}

export const PROJECT_METADATA = {
  course: 'INE410159 · Visão Computacional · Grupo 26',
  title: 'Argumentação Jurídica Visual',
  subtitle: 'Resultados verificáveis, auditoria de esquemas e pacote experimental CASE01',
  author: 'Ana Vitória Vanzin Mendes · Trabalho com Guilherme',
  date: '13/10/2026',
  legalCommit: '16919e55dd570387f67f83227a2d5cbf3639f8b8',
  referenceCommit: 'd374ac21ca0645c4a49e8ad719a1845afe8754f7',
  pilotStatus: 'PAUSADO · SEM EXECUÇÃO CANDIDATA (0 rodadas executadas)',
};

export const STATUS_ROWS: StatusRow[] = [
  {
    frente: 'Auditoria jurídica',
    estado: 'Documentada',
    evidenciaLimite: 'Dez esquemas; seis conjuntos de correções; incertezas bibliográficas preservadas',
    category: 'juridico',
  },
  {
    frente: 'Perfis jurídicos',
    estado: 'Propostos',
    evidenciaLimite: 'Classificação verbal e testemunho, versão 0.1; catálogo executable=false',
    category: 'juridico',
  },
  {
    frente: 'Oráculos',
    estado: 'Especificados, não executados',
    evidenciaLimite: '7 classificação + 9 testemunho; não há motor jurídico completo',
    category: 'juridico',
  },
  {
    frente: 'Integridade documental',
    estado: 'Passou',
    evidenciaLimite: 'Check local de 10/2/16 e quatro linhas booleanas; não examinou imagens',
    category: 'software',
  },
  {
    frente: 'Checker CASE01',
    estado: 'Software conferido',
    evidenciaLimite: 'Seis fixtures sintéticos aprovados; confere formato/vinculação/política declarada',
    category: 'software',
  },
  {
    frente: 'Modelo jurídico Gemma 4',
    estado: 'Não executado, pausado',
    evidenciaLimite: 'Zero candidatos; CSV só cabeçalho e JSONL vazio (ausência de execução ≠ acurácia zero)',
    category: 'juridico',
  },
  {
    frente: 'Referência visual CASE01',
    estado: 'Provisória',
    evidenciaLimite: 'Anotação assistida, exposta à fonte; revisão humana por Ana pendente',
    category: 'juridico',
  },
  {
    frente: 'Baseline de Guilherme',
    estado: 'Histórico meteorológico',
    evidenciaLimite: '720 avaliações salvas em 90 casos; recontagem não refez julgamentos',
    category: 'historico',
  },
  {
    frente: 'Ambiente Mac',
    estado: 'Dry-run passou',
    evidenciaLimite: 'SDKs ausentes no interpretador testado explicam exit 1 global; não bloquearam dry-run',
    category: 'ambiente',
  },
  {
    frente: 'AI Studio',
    estado: 'Setup separado',
    evidenciaLimite: 'Dificuldade/erro de acesso/configuração não representa resultado experimental',
    category: 'ambiente',
  },
  {
    frente: 'DGX',
    estado: 'Não verificada',
    evidenciaLimite: 'Sem autenticação ou execução remota nesta tarefa',
    category: 'ambiente',
  },
  {
    frente: 'GitLab privado',
    estado: 'Não confirmado',
    evidenciaLimite: 'Histórico de solicitação/publicação pendente; 404 privado não prova ausência',
    category: 'ambiente',
  },
  {
    frente: 'Codex barra lateral',
    estado: 'Cadastro manual pendente',
    evidenciaLimite: 'Pasta existe; ferramentas listam Projetos e VISÃO COMPUTACIONAL, mas não projeto local individual',
    category: 'ambiente',
  },
];

export const SCHEMES_CATALOG: SchemeCatalogItem[] = [
  {
    number: 1,
    id: 'analogy_v1',
    title: 'Argument from Analogy (version 1)',
    visual_role: 'auxiliary',
    categories: ['A', 'L'],
    action: 'Preserved; declare polarity and legally relevant similarity',
    evidence: 'R1 p.142',
    executable: false,
  },
  {
    number: 2,
    id: 'analogy_v2',
    title: 'Argument from Analogy (version 2)',
    visual_role: 'auxiliary',
    categories: ['T', 'A', 'L'],
    action: 'Preserved; relevance premise is not independently represented',
    evidence: 'Internal comparison; exact source unresolved',
    executable: false,
  },
  {
    number: 3,
    id: 'verbal_classification',
    title: 'Defeasible Argument from a Verbal Classification',
    visual_role: 'pilot',
    categories: ['T', 'A', 'L'],
    action: 'Defeasible wording corrected; predicate semantics and CQ2 signature preserved pending contract',
    evidence: 'R1 p.140, related variant',
    executable: false,
  },
  {
    number: 4,
    id: 'established_rule',
    title: 'Argument from an Established Rule',
    visual_role: 'secondary',
    categories: ['T', 'A', 'L'],
    action: 'Duplicate CQ2 corrected to CQ3; deontic and scope issues annotated',
    evidence: 'Internal CQ table; R1 section 4 is related',
    executable: false,
  },
  {
    number: 5,
    id: 'exceptional_case',
    title: 'Argument from an Exceptional Case',
    visual_role: 'secondary',
    categories: ['A', 'L'],
    action: 'Preserved; conditional CQs and evidence binding need explicit policy',
    evidence: 'Internal comparison; R1/R2 exception semantics',
    executable: false,
  },
  {
    number: 6,
    id: 'witness_testimony',
    title: 'Argument from Witness Testimony',
    visual_role: 'pilot',
    categories: ['T', 'A', 'L'],
    action: 'Title/table completed; adapted rule preserved; five CQs require separate coverage',
    evidence: 'R1 pp.143-144; R3 p.256',
    executable: false,
  },
  {
    number: 7,
    id: 'ad_populum',
    title: 'Position-to-know Ad Populum Argument',
    visual_role: 'exclude_initial',
    categories: ['A', 'L'],
    action: 'Preserved; universal quantification and source unresolved',
    evidence: 'Internal comparison only',
    executable: false,
  },
  {
    number: 8,
    id: 'counterexample',
    title: 'Counterexample Scheme',
    visual_role: 'exclude_initial',
    categories: ['T', 'A', 'L'],
    action: 'Directional natural language clarified; fixed current-case context documented',
    evidence: 'R1 p.142; R2 section 5',
    executable: false,
  },
  {
    number: 9,
    id: 'precedent_preference',
    title: 'Preference from Precedent Scheme',
    visual_role: 'exclude_initial',
    categories: ['T', 'L'],
    action: 'Positive counterexample replaced by existential exception; conclusion favors party',
    evidence: 'R1 p.142',
    executable: false,
  },
  {
    number: 10,
    id: 'factor_comparison',
    title: 'Factor Comparison Scheme',
    visual_role: 'exclude_initial',
    categories: ['T', 'A', 'L'],
    action: 'defendant spelling corrected; issue binding and compound party terms annotated',
    evidence: 'R1 p.142',
    executable: false,
  },
];

export const SCHEME_PROFILES: SchemeProfile[] = [
  {
    id: 'verbal_classification',
    source_scheme_number: 3,
    predicates: {
      classified_as: ['entity', 'category'],
      classification_warrant: ['category', 'property'],
      has_property: ['entity', 'property'],
    },
    premises: [
      {
        predicate: 'classified_as',
        args: ['A', 'C'],
        role: 'ordinary',
        allowed_source: ['image', 'context'],
      },
      {
        predicate: 'classification_warrant',
        args: ['C', 'F'],
        role: 'ordinary',
        allowed_source: ['provided_rule'],
      },
    ],
    conclusion: {
      predicate: 'has_property',
      args: ['A', 'F'],
      modality: 'defeasible',
    },
    critical_questions: [
      {
        id: 'CQ1',
        target: ['A', 'F'],
        question: 'Grounded doubt about property F in A?',
      },
      {
        id: 'CQ2',
        target: ['A', 'C'],
        question: 'Weak or disputed classification of A as C?',
      },
    ],
    cq_states: [
      'resolved_no_defeater',
      'defeater_established',
      'unknown',
      'not_applicable_justified',
    ],
  },
  {
    id: 'witness_testimony',
    source_scheme_number: 6,
    adaptation: 'position_to_observe specializes position_to_know for controlled visual cases',
    predicates: {
      states: ['witness', 'proposition'],
      position_to_observe: ['witness', 'proposition', 'scene', 'time'],
      truthfulness_assumption: ['witness', 'proposition'],
    },
    premises: [
      {
        predicate: 'states',
        args: ['W', 'S'],
        role: 'ordinary',
        allowed_source: ['testimony_text', 'testimony_audio'],
      },
      {
        predicate: 'position_to_observe',
        args: ['W', 'S', 'SCENE', 'TIME'],
        role: 'ordinary',
        allowed_source: ['image_plus_context'],
      },
      {
        predicate: 'truthfulness_assumption',
        args: ['W', 'S'],
        role: 'assumption',
        allowed_source: ['explicit_scenario_assumption'],
      },
    ],
    conclusion: {
      proposition_variable: 'S',
      modality: 'defeasible',
    },
    critical_questions: [
      {
        id: 'CQ1',
        target: ['W', 'S'],
        question: 'Internal consistency?',
      },
      {
        id: 'CQ2',
        target: ['W', 'S'],
        question: 'Consistency with independent case evidence?',
      },
      {
        id: 'CQ3',
        target: ['W', 'S'],
        question: 'Consistency with independent witnesses?',
      },
      {
        id: 'CQ4',
        target: ['W', 'S'],
        question: 'Relevant bias?',
      },
      {
        id: 'CQ5',
        target: ['S'],
        question: 'Plausibility in the circumstances?',
      },
    ],
    cq_states: [
      'resolved_no_defeater',
      'defeater_established',
      'unknown',
      'not_applicable_justified',
    ],
  },
];

export const ACCEPTANCE_CASES: AcceptanceCase[] = [
  {
    id: 'VC01',
    scheme: 'verbal_classification',
    scenario: 'Same A/C/F; supplied warrant; reviewed image supports class; CQs resolved',
    expected: {
      structure: 'pass',
      semantics: 'match',
      visual: 'supported',
      argument_status: 'provisionally_supported',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'VC02',
    scheme: 'verbal_classification',
    scenario: 'Conclusion changes A to another object',
    expected: {
      structure: 'fail',
      semantics: 'mismatch',
      visual: 'supported',
      argument_status: 'unresolved',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'VC03',
    scheme: 'verbal_classification',
    scenario: 'All predicate names present but category C differs between premises',
    expected: {
      structure: 'fail',
      semantics: 'mismatch',
      visual: 'supported',
      argument_status: 'unresolved',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'VC04',
    scheme: 'verbal_classification',
    scenario: 'Well-formed warrant invented by model, with no provided-rule source',
    expected: {
      structure: 'fail',
      semantics: 'mismatch',
      visual: 'supported',
      argument_status: 'unresolved',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'VC05',
    scheme: 'verbal_classification',
    scenario: 'Image absent for a premise designated exclusively visual; no alternative source',
    expected: {
      structure: 'pass',
      semantics: 'unreviewed',
      visual: 'insufficient',
      argument_status: 'unresolved',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'VC06',
    scheme: 'verbal_classification',
    scenario: 'Image contradicts classification but candidate syntax is correct',
    expected: {
      structure: 'pass',
      semantics: 'mismatch',
      visual: 'contradicted',
      argument_status: 'defeated',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'VC07',
    scheme: 'verbal_classification',
    scenario: 'Relevant feature occluded; model correctly abstains in evidence report',
    expected: {
      structure: 'pass',
      semantics: 'match',
      visual: 'insufficient',
      argument_status: 'unresolved',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'WT01',
    scheme: 'witness_testimony',
    scenario: 'Calibrated scene and synchronized context support opportunity; testimony and assumption supplied; all CQs resolved or justified N/A',
    expected: {
      structure: 'pass',
      semantics: 'match',
      visual: 'supported',
      argument_status: 'provisionally_supported',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'WT02',
    scheme: 'witness_testimony',
    scenario: 'Scene proves line of sight obstructed; only opportunity premise refuted',
    expected: {
      structure: 'pass',
      semantics: 'mismatch',
      visual: 'contradicted',
      argument_status: 'defeated',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'WT03',
    scheme: 'witness_testimony',
    scenario: 'Model infers truthfulness from face; no declared assumption',
    expected: {
      structure: 'fail',
      semantics: 'mismatch',
      visual: 'insufficient',
      argument_status: 'unresolved',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'WT04',
    scheme: 'witness_testimony',
    scenario: 'states uses witness W1 but observation premise uses W2',
    expected: {
      structure: 'fail',
      semantics: 'mismatch',
      visual: 'supported',
      argument_status: 'unresolved',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'WT05',
    scheme: 'witness_testimony',
    scenario: 'Same geometry but incompatible observation time',
    expected: {
      structure: 'pass',
      semantics: 'mismatch',
      visual: 'insufficient',
      argument_status: 'unresolved',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'WT06',
    scheme: 'witness_testimony',
    scenario: 'One required CQ remains unknown despite supportive scene',
    expected: {
      structure: 'pass',
      semantics: 'match',
      visual: 'supported',
      argument_status: 'unresolved',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'WT07',
    scheme: 'witness_testimony',
    scenario: 'Opportunity premise refuted; candidate concludes explicit negation of S',
    expected: {
      structure: 'fail',
      semantics: 'mismatch',
      visual: 'contradicted',
      argument_status: 'defeated',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'WT08',
    scheme: 'witness_testimony',
    scenario: 'No testimony supplied; model invents states(W,S) from scene',
    expected: {
      structure: 'fail',
      semantics: 'mismatch',
      visual: 'supported',
      argument_status: 'unresolved',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
  {
    id: 'WT09',
    scheme: 'witness_testimony',
    scenario: "Image supports statement compatibility, but camera viewpoint is unrelated to W's position",
    expected: {
      structure: 'pass',
      semantics: 'mismatch',
      visual: 'insufficient',
      argument_status: 'unresolved',
    },
    kind: 'proposed_acceptance_oracle_not_executed',
  },
];

export const NOTION_EDITS: NotionEdit[] = [
  {
    context_label: 'Esquema 4 · Established Rule ( Numeração de CQ duplicada )',
    old_str: 'cq(cq2, not excuses(E))[as(as4ER)].',
    new_str: 'cq(cq3, not excuses(E))[as(as4ER)].',
  },
  {
    context_label: 'Esquema 10 · Factor Comparison ( Ortografia do predicado )',
    old_str: 'factors_favor(deffendant(P))',
    new_str: 'factors_favor(defendant(P))',
  },
  {
    context_label: 'Esquema 6 · Witness Testimony ( Ortografia do título )',
    old_str: '# 6. Argument from Witness Testemony',
    new_str: '# 6. Argument from Witness Testimony',
  },
  {
    context_label: 'Esquema 6 · Witness Testimony ( Premissa de declaração e conclusão derrotável )',
    old_str: '<td>Witness W is telling the truth (as W knows it)</td>\n</tr>\n</table>',
    new_str:
      '<td>Witness W is telling the truth (as W knows it)</td>\n</tr>\n<tr>\n<td>Statement Premise — explicit in the adapted rule below</td>\n<td>Witness W states that S is true, and S concerns domain D.</td>\n</tr>\n<tr>\n<td>Defeasible Conclusion — explicit in the adapted rule below</td>\n<td>S may plausibly be taken to be true.</td>\n</tr>\n</table>',
  },
  {
    context_label: 'Esquema 3 · Verbal Classification ( Modalidade derrotável vs universal estrita )',
    old_str: 'All <C> is <F>. <A> can be classified as <C>. Therefore, <A> is <F>.',
    new_str:
      'Normally, an item classified as <C> has property <F>. <A> can be classified as <C>. Therefore, <A> defeasibly has property <F>.',
  },
  {
    context_label: 'Esquema 8 · Counterexample ( Direcionalidade da comparação com o caso atual )',
    old_str: '<PC2> and <PC1> has more on point of similarity.',
    new_str: 'Relative to the current case under consideration, <PC2> is more on-point than <PC1>.',
  },
  {
    context_label: 'Esquema 9 · Preference from Precedent ( Polaridade: contraexemplo como exceção existencial )',
    old_str: 'defeasible_rule(factors_favor(P,PC2),\n[\n\tdecision(PC1,P),\n  there_is(is_counterexample(PC2,PC1)),\n])[as(asP4P)]',
    new_str:
      '// Conceptual representation; no target-engine syntax is asserted.\n// Scope: one fixed current case and issue (Gordon & Walton 2009, p. 142).\n// PC2 is existentially quantified inside the exception for this PC1.\n{\n  scheme: "asP4P",\n  ordinary_premises: ["decision(PC1,P)"],\n  exceptions: ["exists PC2: is_counterexample(PC2,PC1)"],\n  defeasible_conclusion: "factors_favor(P)"\n}',
  },
  {
    context_label: 'Esquema 9 · Preference from Precedent ( Linguagem natural e status de exceção )',
    old_str:
      'There is a precedente case <PC1> decided to <P>.\nOn the other hand, there is a counterexample <PC2>.\nTherefore, factors favor <PC1>.',
    new_str:
      'Precedent case <PC1> was decided in favor of party <P>.\nThis supports, defeasibly, that the factors favor <P> in the fixed current-case context.\nAn established counterexample <PC2> to <PC1> defeats this argument.\nAn unknown counterexample status must be recorded explicitly; it is not proof that no counterexample exists.',
  },
];

export const BIBLIOGRAPHIC_SOURCES = [
  {
    id: 'R1',
    filename: 'LegalReasoningWithArgumentationSchemes.pdf',
    authors: 'Gordon & Walton (2009)',
    sha256: 'f2138e982dad15f736c9932c6ee0b5ec1495114044dbe0a76f885934f202c050',
    bytes: 435109,
    read_on: '2026-10-12',
    redistributed: false,
  },
  {
    id: 'R2',
    filename: 'ArgumentSchemesforLegalCaseBasedReasoning.pdf',
    authors: 'Wyner & Bench-Capon (2007)',
    sha256: '08238229382b90b1196896bb419d1b897de6d17d05c288044bc71000370d3cda',
    bytes: 73351,
    read_on: '2026-10-12',
    redistributed: false,
  },
  {
    id: 'R3',
    filename: 'UsingArgumentationSchemesToFindMotivesAndIntentionsOfARationalAgent.pdf',
    authors: 'Bex & Walton (2016)',
    sha256: 'f304659ed4411e935b35eed01b665ef8899bdf61267676b0a0a1daa8a77d9eb1',
    bytes: 868078,
    read_on: '2026-10-12',
    redistributed: false,
  },
];

export const CASE01_DATA = {
  caseId: 'CASE01',
  targetModel: 'Google Gemma 4 (Pausado — 0 execuções)',
  imagePath: '/04-experimentos/gemma4-case01/model-input/images/case01.jpg',
  imageSha256: '02c79b6a08236946b7b96a9971bfe16558fde4dc721d15ea240fef8ec763d265',
  dimensions: { width: 1280, height: 827 },
  operationalCategory: {
    id: 'bicicleta_visual',
    definition:
      'Configuração visual com duas rodas distintas, quadro, guidão, selim e pelo menos um conjunto pedal/manivela visível. A categoria descreve aparência segundo esses critérios e não prova funcionamento, propriedade, identidade, ausência de motor oculto ou estatuto em lei real.',
  },
  hypotheticalRule: {
    source_id: 'R1',
    version: '1',
    kind: 'supplied_fictional_rule',
    category: 'bicicleta_visual',
    property: 'deve_ser_conduzido_a_mao_na_zona_Z',
    scope: 'Apenas cenário fictício com zona Z estipulada. Não constitui direito vigente.',
    not_observed_in_pixels: true,
  },
  prompts: {
    with_image: `CONDIÇÃO: with_image. Uma imagem IMG01 é fornecida em anexo. Observe somente seus pixels.

Você participa de um ensaio exploratório de um único caso. Use somente o texto abaixo e, se fornecida nesta condição, a imagem. Não use navegação, outras conversas, fonte da fotografia, filenames descritivos ou arquivos de referência. Não há evidência adicional escondida no texto. Definições de categoria não afirmam que o objeto pertence à categoria.

CASO: CASE01. A designa o objeto central eventualmente mostrado na imagem. O cenário é fictício, sem vínculo com um processo real.

CATEGORIA OPERACIONAL C = bicicleta_visual: configuração visual com duas rodas distintas, quadro, guidão, selim e pelo menos um conjunto pedal/manivela visível. A categoria descreve aparência segundo esses critérios e não prova funcionamento, propriedade, identidade, ausência de motor oculto ou estatuto em lei real.

REGRA HIPOTÉTICA FORNECIDA R1, versão 1: para este cenário de demonstração, se A pertence à categoria bicicleta_visual, A recebe a propriedade normativa deve_ser_conduzido_a_mao_na_zona_Z. Trata-se de regra fictícia, não afirmação de direito vigente. A pertinência da zona Z e a regra são estipuladas pelo texto, não inferidas da fotografia. Nenhuma identidade, intenção, culpa ou causalidade deve ser inferida.

PERFIL FORMAL: verbal_classification, versão 0.1.
classified_as(A,C) + classification_warrant(C,F) => defeasibly has_property(A,F).`,
    without_image: `CONDIÇÃO: without_image. Nenhuma imagem foi fornecida. Use somente este texto e não procure imagens ou metadados.

Você participa de um ensaio exploratório de um único caso. Use somente o texto abaixo e, se fornecida nesta condição, a imagem. Não use navegação, outras conversas, fonte da fotografia, filenames descritivos ou arquivos de referência. Não há evidência adicional escondida no texto. Definições de categoria não afirmam que o objeto pertence à categoria.

CASO: CASE01. A designa o objeto central eventualmente mostrado na imagem. O cenário é fictício, sem vínculo com um processo real.

CATEGORIA OPERACIONAL C = bicicleta_visual: configuração visual com duas rodas distintas, quadro, guidão, selim e pelo menos um conjunto pedal/manivela visível...`,
  },
  provisionalReference: {
    status: 'assistant_multimodal_preannotation_not_human_gold',
    annotatorRole: 'Separate assistant agent /root/pilot_reference (Sem adjudicação humana por Ana)',
    sourceBlinding: false,
    sourceExposureNote:
      'O anotador verificou proveniência/licença e recebeu metadados descritivos da página antes dos pixels; a pré-anotação não foi cega à fonte.',
    regions: [
      {
        id: 'object_region',
        label: 'Objeto A (bicicleta_visual)',
        coords: [0.039, 0.14, 0.948, 0.953] as [number, number, number, number],
        color: '#146563',
        detail: 'Critério global: duas rodas distintas, quadro, guidão, selim e conjunto pedal/manivela inferior.',
      },
      {
        id: 'wheel_left',
        label: 'Q1 · Roda Esquerda',
        coords: [0.054, 0.369, 0.421, 0.916] as [number, number, number, number],
        color: '#0f766e',
        detail: 'Circunferência de roda espacialmente distinta à esquerda com aro/pneu e raios visíveis.',
      },
      {
        id: 'wheel_right',
        label: 'Q1 · Roda Direita',
        coords: [0.586, 0.41, 0.947, 0.945] as [number, number, number, number],
        color: '#0f766e',
        detail: 'Circunferência de roda espacialmente distinta à direita com aro/pneu e raios visíveis.',
      },
      {
        id: 'frame',
        label: 'Q3 · Quadro (Preto predominante)',
        coords: [0.267, 0.289, 0.681, 0.656] as [number, number, number, number],
        color: '#8d550b',
        detail: 'Tubos estruturais principais com revestimento predominantemente preto e reflexos claros de luz.',
      },
      {
        id: 'handlebar',
        label: 'Critério · Guidão Superior',
        coords: [0.505, 0.137, 0.641, 0.222] as [number, number, number, number],
        color: '#1d4ed8',
        detail: 'Guidão superior visível no enquadramento.',
      },
      {
        id: 'saddle',
        label: 'Critério · Selim',
        coords: [0.301, 0.218, 0.423, 0.313] as [number, number, number, number],
        color: '#7c3aed',
        detail: 'Selim visível na região média-superior esquerda.',
      },
      {
        id: 'pedal_crank',
        label: 'Q2 · Conjunto Pedal/Manivela',
        coords: [0.363, 0.611, 0.554, 0.775] as [number, number, number, number],
        color: '#b45309',
        detail: 'Manivela parte do eixo do pedivela em direção a um pedal à direita.',
      },
    ],
    observedFacts: [
      'Um objeto principal completo no enquadramento, em vista aproximadamente lateral.',
      'A porção principal do objeto não toca as bordas da fotografia; pneus e guidão estão dentro do enquadramento.',
      'Não há pessoa reconhecível visível.',
      'Fundo externo desfocado; detalhe traseiro tem proteção que oculta parcialmente componentes internos da transmissão.',
    ],
    invisibleOrInsufficient: [
      'Componentes internos sob coberturas; não é possível afirmar ausência de motor oculto.',
      'Funcionamento, capacidade de deslocamento e estado mecânico não são demonstrados pela fotografia.',
      'Proprietário, identidade, intenção, culpa, causalidade ou direitos sobre o objeto não são inferíveis dos pixels.',
      'Local real, presença em uma zona normativa real ou direito vigente não são estabelecidos pela fotografia.',
      'Pré-anotação por assistente multimodal, sem validação humana independente e sem adjudicação de Ana.',
    ],
  },
};

export const METEOROLOGICAL_BASELINE = {
  repository: 'GuiT2002/comma2026-multimodal-argumentation',
  commit: 'd374ac21ca0645c4a49e8ad719a1845afe8754f7',
  archiveCommit: '637ca43c2420b73f409dd1478618942c7bcec13e (07/10/2026)',
  totalCases: 90,
  totalEvaluations: 720,
  uniquePngHashes: 23,
  lexicalPredicatesChecked: ['position_to_know', 'asserts', 'contain'],
  byCondition: [
    {
      condition: 'Completa (Entimema + Imagem + Contexto)',
      code: 'col4',
      evaluations: 180,
      lexicalHits: 179,
      lexicalPct: '99,44%',
      semanticHits: 100,
      semanticPct: '55,56%',
      claudeSemantic: '53/90',
      deepseekSemantic: '47/90',
    },
    {
      condition: 'Sem entimema (Imagem + Contexto)',
      code: 'col1',
      evaluations: 180,
      lexicalHits: 164,
      lexicalPct: '91,11%',
      semanticHits: 85,
      semanticPct: '47,22%',
      claudeSemantic: '46/90',
      deepseekSemantic: '39/90',
    },
    {
      condition: 'Sem contexto (Entimema + Imagem)',
      code: 'col2',
      evaluations: 180,
      lexicalHits: 174,
      lexicalPct: '96,67%',
      semanticHits: 40,
      semanticPct: '22,22%',
      claudeSemantic: '23/90',
      deepseekSemantic: '17/90',
    },
    {
      condition: 'Sem imagem (Entimema + Contexto)',
      code: 'col3',
      evaluations: 180,
      lexicalHits: 140,
      lexicalPct: '77,78%',
      semanticHits: 2,
      semanticPct: '1,11%',
      claudeSemantic: '2/90',
      deepseekSemantic: '0/90',
    },
  ],
  byModel: [
    {
      model: 'Claude (arquivado como claude-sonnet-4-6)',
      configNote: 'main.py atual menciona claude-sonnet-5-5, mas cabeçalhos salvos são 4-6',
      evaluations: 360,
      lexicalHits: 356,
      lexicalPct: '98,89%',
      semanticHits: 124,
      semanticPct: '34,44%',
    },
    {
      model: 'deepseek-flash',
      configNote: 'Juiz configurado em código: deepseek-v4-pro',
      evaluations: 360,
      lexicalHits: 301,
      lexicalPct: '83,61%',
      semanticHits: 103,
      semanticPct: '28,61%',
    },
  ],
  byClass: [
    {
      classId: 'class1',
      name: 'Geográfica',
      cases: 64,
      sharePct: '71,11%',
      uniqueHashes: 17,
      evaluations: 512,
    },
    {
      classId: 'class2',
      name: 'Temporal',
      cases: 15,
      sharePct: '16,67%',
      uniqueHashes: 6,
      evaluations: 120,
    },
    {
      classId: 'class3',
      name: 'Geográfica + Temporal',
      cases: 11,
      sharePct: '12,22%',
      uniqueHashes: 3,
      evaluations: 88,
    },
  ],
  jointDistribution: {
    yesLexical_yesSemantic: 227,
    yesLexical_noSemantic: 430,
    noLexical_yesSemantic: 0,
    noLexical_noSemantic: 63,
  },
  auditLimitations: [
    '430/720 saídas possuem os três predicados lexicais (position_to_know, asserts, contain), mas conclusão sem correspondência semântica.',
    'Apenas 23 hashes PNG únicos globalmente para 90 casos (reuso de imagens entre classes e casos).',
    'Erro literal documentado em expected_outputs/class2.txt (linha 5): premissas cloudy(monday) e conclusão cloudy(modany).',
    '1 registro legado em DeepSeek class1 caso 1 une entimema/contexto e tem 7 campos, aceito por regra explícita do validador.',
    'Domínio exclusivamente meteorológico/geotemporal: não mede desempenho jurídico nem valida unificação formal de variáveis.',
  ],
};

export const REPOSITORY_DIRECTORY_MAP = [
  {
    folder: '00-indice',
    summary: 'Índice, status em 13/10/2026, proveniência, manifestos SHA-256 e política de versionamento',
    keyFiles: ['STATUS.md', 'MAPA.md', 'LACUNAS.md', 'MANIFESTO-CENTRAL-SHA256.json', 'ferramentas/validar_organizacao.py'],
  },
  {
    folder: '01-contexto',
    summary: 'Registro da reunião de 08/10/2026, HTML exportado como dado e leitura textual sem scripts',
    keyFiles: ['README.md', 'reuniao-2026-10-08/TRABALHO DE VISAO COMPUTACIONAL...leitura.txt'],
  },
  {
    folder: '02-bibliografia-recursos',
    summary: 'Material didático sobre visão computacional, referências da auditoria (R1–R3) e recursos externos',
    keyFiles: ['README.md', 'recursos-externos.json', 'material-didatico/explicador_visao_computacional.leitura.txt'],
  },
  {
    folder: '03-esquemas',
    summary: 'Dez esquemas auditados, seis conjuntos de correções, dois perfis v0.1 e 16 oráculos propostos',
    keyFiles: ['parecer-formal.original.md', 'pacote-documental-2026-10-12/schemes/catalog.json', 'pacote-documental-2026-10-12/schemes/profiles.json', 'pacote-documental-2026-10-12/tests/acceptance-cases.json'],
  },
  {
    folder: '04-experimentos',
    summary: 'CASE01 Gemma 4 preparado e pausado; separação estrita entre model-input e evaluator-only',
    keyFiles: ['gemma4-case01/execution-plan.json', 'gemma4-case01/model-input/hypothetical-rule.json', 'gemma4-case01/evaluator-only/reference/gold.json', 'gemma4-case01/evaluator-only/tools/validate_candidate.py'],
  },
  {
    folder: '05-resultados',
    summary: 'Checks locais de software e linha de base meteorológica histórica atribuída a Guilherme',
    keyFiles: ['juridico-gemma/estado.json', 'checks-juridicos-2026-10-13/legal-package-check.json', 'baseline-meteorologico-guilherme/RESULTADOS-REFERENCIA.md'],
  },
  {
    folder: '06-ambiente',
    summary: 'Preflight protegido no Mac (Python 3.11.17 ARM64), logs de dry-run e diagnóstico Codex',
    keyFiles: ['preflight-mac/README-RESULTADO.md', 'preflight-mac/check_cv.py', 'CODEX-PROJETO.md'],
  },
  {
    folder: '07-apresentacoes',
    summary: 'Apresentação consolidada e briefing para conversa com Guilherme, preservando entregas anteriores',
    keyFiles: ['APRESENTACAO.html', 'BRIEFING.md', 'registros-originais/RESULTADOS-INE410159-2026-10-13.md'],
  },
];
