export interface FormNormalizedRegion {
  id: string;
  label: string;
  coords: [number, number, number, number]; // [x0, y0, x1, y1] normalized 0..1
  color: string;
  extractedText: string;
  schemeRole: string;
  epistemicNote: string;
}

export interface FormPageSpec {
  pageNumber: number;
  title: string;
  regions: FormNormalizedRegion[];
  blocks: Array<{
    id: string;
    coords: [number, number, number, number];
    heading?: string;
    content: string;
    isParatextButtonBar?: boolean;
    buttons?: string[];
  }>;
}

export interface ProceduralDeadlineScenario {
  id: string;
  label: string;
  partyCategory: string;
  conditionSummary: string;
  derivedDeadline: '21_days' | '60_days' | '90_days' | 'abstention_or_defeated';
  ruleSourceId: string;
  ruleCitation: string;
  verbalClassificationInstance: {
    premises: Array<{
      predicate: string;
      args: [string, string];
      source: string;
      role: 'ordinary' | 'assumption';
    }>;
    conclusion: {
      predicate: string;
      args: [string, string];
      modality: 'defeasible';
    } | null;
    cqs: Array<{
      id: string;
      question: string;
      state: 'resolved_no_defeater' | 'defeater_established' | 'unknown';
      reason: string;
    }>;
  };
  establishedRuleInstance: {
    schemeId: 'established_rule';
    premises: Array<{
      predicate: string;
      args: string[];
      source: string;
    }>;
    conclusion: {
      predicate: string;
      args: string[];
      modality: 'defeasible';
    } | null;
    cqs: Array<{
      id: 'CQ1' | 'CQ2' | 'CQ3';
      formalTag: string;
      question: string;
      state: 'resolved_no_defeater' | 'defeater_established' | 'unknown';
      reason: string;
    }>;
  };
}

export interface FederalFormCaseSpec {
  caseId: 'CASE02' | 'CASE03' | 'CASE04';
  formCode: string;
  formTitle: string;
  revisionDate: string;
  primaryRules: string[];
  summary: string;
  pages: FormPageSpec[];
  scenarios: ProceduralDeadlineScenario[];
}

export const FEDERAL_FORM_CASES: FederalFormCaseSpec[] = [
  {
    caseId: 'CASE02',
    formCode: 'AO 399',
    formTitle: 'Waiver of the Service of Summons',
    revisionDate: '01/09',
    primaryRules: ['Fed. R. Civ. P. 4(d)', 'Fed. R. Civ. P. 12(a)(1)(A)(ii)'],
    summary:
      'Termo de renúncia ao cumprimento formal de citação (Waiver of Service). Estabelece prazo derrotável de 60 dias a contar da data de envio da solicitação (ou 90 dias se enviado para fora dos Estados Unidos), preservando defesas de jurisdição e foro mas renunciando a objeções sobre ausência de citação.',
    pages: [
      {
        pageNumber: 1,
        title: 'Página 1 · AO 399 (01/09) Waiver of the Service of Summons',
        regions: [
          {
            id: 'ao399_header_id',
            label: 'Identificador Paratextual (AO 399)',
            coords: [0.05, 0.04, 0.42, 0.08],
            color: '#146563',
            extractedText: 'AO 399 (01/09) Waiver of the Service of Summons',
            schemeRole: 'classified_as(DOC, form_ao399_waiver)',
            epistemicNote: 'Evidência visual direta impressa no canto superior esquerdo da folha.',
          },
          {
            id: 'ao399_court_caption',
            label: 'Cabeçalho da Corte & Partes (Plaintiff v. Defendant)',
            coords: [0.05, 0.09, 0.92, 0.25],
            color: '#1d4ed8',
            extractedText: 'UNITED STATES DISTRICT COURT for the _____ District of _____ | Plaintiff v. Defendant | Civil Action No.',
            schemeRole: 'context_binding(Case, Plaintiff, Defendant)',
            epistemicNote: 'Os campos em branco indicam formulário-modelo não preenchido nos pixels.',
          },
          {
            id: 'ao399_deadline_60_90',
            label: 'Cláusula Normativa de Prazo (60 dias EUA / 90 dias Exterior)',
            coords: [0.06, 0.45, 0.94, 0.52],
            color: '#8d550b',
            extractedText:
              'I also understand that I, or the entity I represent, must file and serve an answer or a motion under Rule 12 within 60 days from _____, the date when this request was sent (or 90 days if it was sent outside the United States).',
            schemeRole: 'established_rule(FRCP_4d3_12a1Aii, 60_days | 90_days)',
            epistemicNote:
              'Estipula a bifurcação condicional: 60 dias (envio doméstico) vs. 90 dias (envio fora dos EUA). Como a data de envio está em branco nos pixels, a aplicação a um caso concreto depende de premissa externa.',
          },
          {
            id: 'ao399_duty_good_cause',
            label: 'Dever de Cooperação & Exceção "Good Cause" (Regra 4)',
            coords: [0.06, 0.76, 0.94, 0.93],
            color: '#7c3aed',
            extractedText:
              'Duty to Avoid Unnecessary Expenses of Serving a Summons: Rule 4 ... requires certain defendants to cooperate ... unless the defendant shows good cause for the failure. "Good cause" does not include a belief that the lawsuit is groundless, or improper venue, or lack of jurisdiction.',
            schemeRole: 'cq(cq3, not excuses(good_cause))',
            epistemicNote:
              'Explicita o escopo de CQ3 no esquema Established Rule: crença de improcedência ou incompetência de foro/jurisdição NÃO constitui "good cause" para recusar a renúncia.',
          },
          {
            id: 'ao399_paratext_buttons',
            label: 'Botões Paratextuais de Formulário Digital (Print / Save As / Reset)',
            coords: [0.06, 0.94, 0.94, 0.98],
            color: '#b45309',
            extractedText: '[Print] [Save As...] [Reset]',
            schemeRole: 'paratext_affordance(interactive_pdf_controls)',
            epistemicNote: 'Artefato visual de formulário eletrônico AcroForm renderizado na imagem.',
          },
        ],
        blocks: [
          {
            id: 'b1',
            coords: [0.06, 0.04, 0.94, 0.08],
            heading: 'AO 399 (01/09) Waiver of the Service of Summons',
            content: 'UNITED STATES DISTRICT COURT for the __________ District of __________',
          },
          {
            id: 'b2',
            coords: [0.06, 0.14, 0.94, 0.25],
            heading: 'WAIVER OF THE SERVICE OF SUMMONS',
            content: 'Plaintiff __________ v. Defendant __________ · Civil Action No. __________',
          },
          {
            id: 'b3',
            coords: [0.06, 0.45, 0.94, 0.52],
            heading: 'Cláusula de Prazo sob a Regra 12 (60 / 90 dias)',
            content:
              'I also understand that I, or the entity I represent, must file and serve an answer or a motion under Rule 12 within 60 days from __________, the date when this request was sent (or 90 days if it was sent outside the United States). If I fail to do so, a default judgment will be entered.',
          },
          {
            id: 'b4',
            coords: [0.06, 0.76, 0.94, 0.92],
            heading: 'Duty to Avoid Unnecessary Expenses of Serving a Summons (Rule 4)',
            content:
              'A defendant who is located in the United States and who fails to return a signed waiver of service requested by a plaintiff located in the United States will be required to pay the expenses of service, unless the defendant shows good cause for the failure.',
          },
          {
            id: 'b5',
            coords: [0.06, 0.94, 0.94, 0.98],
            content: 'Controles AcroForm:',
            isParatextButtonBar: true,
            buttons: ['Print', 'Save As...', 'Reset'],
          },
        ],
      },
    ],
    scenarios: [
      {
        id: 'ao399_60d_domestic',
        label: 'Cenário 1 · Prazo de 60 Dias (Renúncia enviada nos EUA — Regra 4(d)(3))',
        partyCategory: 'reu_domiciliado_eua_com_waiver_assinado',
        conditionSummary:
          'O documento é classificado visualmente como AO 399; estipula-se que a solicitação foi enviada a réu dentro dos EUA e assinada sem exceções.',
        derivedDeadline: '60_days',
        ruleSourceId: 'RULE_FRCP_4D3',
        ruleCitation: 'Fed. R. Civ. P. 4(d)(3) & 12(a)(1)(A)(ii)',
        verbalClassificationInstance: {
          premises: [
            {
              predicate: 'classified_as',
              args: ['DOC_AO399', 'waiver_of_service_domestic_request'],
              source: 'IMG_AO399 + STIPULATED_CONTEXT',
              role: 'ordinary',
            },
            {
              predicate: 'classification_warrant',
              args: ['waiver_of_service_domestic_request', 'deadline_60_days_from_request_sent'],
              source: 'RULE_FRCP_4D3',
              role: 'ordinary',
            },
          ],
          conclusion: {
            predicate: 'has_property',
            args: ['DOC_AO399', 'deadline_60_days_from_request_sent'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              question: 'Há dúvida fundamentada sobre a aplicação do prazo de 60 dias a DOC_AO399?',
              state: 'resolved_no_defeater',
              reason: 'O texto impresso no parágrafo 4 estabelece 60 dias para envio doméstico.',
            },
            {
              id: 'CQ2',
              question: 'A classificação visual do formulário como AO 399 é fraca ou disputada?',
              state: 'resolved_no_defeater',
              reason: 'Cabeçalho AO 399 (01/09) e título WAIVER OF THE SERVICE OF SUMMONS legíveis.',
            },
          ],
        },
        establishedRuleInstance: {
          schemeId: 'established_rule',
          premises: [
            {
              predicate: 'general_rule',
              args: ['FRCP_12a1Aii', 'timely_waiver_returned_domestic', 'serve_answer_within_60_days'],
              source: 'RULE_FRCP_4D3',
            },
            {
              predicate: 'satisfies_condition',
              args: ['Defendant_A', 'timely_waiver_returned_domestic'],
              source: 'IMG_AO399 + STIPULATED_CONTEXT',
            },
          ],
          conclusion: {
            predicate: 'deontic_obligation',
            args: ['Defendant_A', 'serve_answer_within_60_days'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              formalTag: 'cq(cq1, rule_applies(FRCP_12a1Aii))',
              question: 'A regra estabelecida (60 dias a partir do envio) aplica-se aos fatos deste caso?',
              state: 'resolved_no_defeater',
              reason: 'Aplicável mediante estipulação de envio doméstico dentro dos EUA.',
            },
            {
              id: 'CQ2',
              formalTag: 'cq(cq2, valid_source(FRCP_12a1Aii))',
              question: 'A regra provém de fonte normativa válida e explícita no formulário?',
              state: 'resolved_no_defeater',
              reason: 'Expressa no 4º parágrafo do AO 399 e no rodapé sobre a Regra 4.',
            },
            {
              id: 'CQ3',
              formalTag: 'cq(cq3, not excuses(E))',
              question: 'Existe exceção ou escusa válida (ex.: envio ao exterior = 90 dias, ou nulidade)?',
              state: 'resolved_no_defeater',
              reason: 'Nenhuma exceção de envio internacional ativada neste cenário.',
            },
          ],
        },
      },
      {
        id: 'ao399_90d_foreign',
        label: 'Cenário 2 · Prazo de 90 Dias (Exceção de envio fora dos EUA — Regra 4(d)(3))',
        partyCategory: 'reu_com_solicitacao_enviada_fora_dos_eua',
        conditionSummary:
          'Ativa a cláusula parentética do AO 399: "(or 90 days if it was sent outside the United States)". Derrota o prazo padrão de 60 dias e estabelece 90 dias.',
        derivedDeadline: '90_days',
        ruleSourceId: 'RULE_FRCP_4D3_FOREIGN',
        ruleCitation: 'Fed. R. Civ. P. 4(d)(3) & 12(a)(1)(A)(ii) (Foreign Dispatch)',
        verbalClassificationInstance: {
          premises: [
            {
              predicate: 'classified_as',
              args: ['DOC_AO399', 'waiver_of_service_foreign_dispatch'],
              source: 'IMG_AO399 + STIPULATED_CONTEXT',
              role: 'ordinary',
            },
            {
              predicate: 'classification_warrant',
              args: ['waiver_of_service_foreign_dispatch', 'deadline_90_days_from_request_sent'],
              source: 'RULE_FRCP_4D3_FOREIGN',
              role: 'ordinary',
            },
          ],
          conclusion: {
            predicate: 'has_property',
            args: ['DOC_AO399', 'deadline_90_days_from_request_sent'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              question: 'Há dúvida sobre a substituição do prazo de 60 por 90 dias?',
              state: 'resolved_no_defeater',
              reason: 'Cláusula parentética explícita na linha 2 do 4º parágrafo do AO 399.',
            },
            {
              id: 'CQ2',
              question: 'A imagem sozinha prova que o envio foi feito para fora dos EUA?',
              state: 'unknown',
              reason: 'A imagem mostra o formulário em branco; o envio ao exterior é estipulado pelo contexto do cenário.',
            },
          ],
        },
        establishedRuleInstance: {
          schemeId: 'established_rule',
          premises: [
            {
              predicate: 'general_rule',
              args: ['FRCP_12a1Aii_Foreign', 'waiver_sent_outside_united_states', 'serve_answer_within_90_days'],
              source: 'RULE_FRCP_4D3_FOREIGN',
            },
            {
              predicate: 'satisfies_condition',
              args: ['Defendant_Foreign', 'waiver_sent_outside_united_states'],
              source: 'IMG_AO399 + STIPULATED_CONTEXT',
            },
          ],
          conclusion: {
            predicate: 'deontic_obligation',
            args: ['Defendant_Foreign', 'serve_answer_within_90_days'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              formalTag: 'cq(cq1, rule_applies(FRCP_12a1Aii_Foreign))',
              question: 'A condição de envio fora dos EUA está satisfeita?',
              state: 'resolved_no_defeater',
              reason: 'Satisfeita por estipulação de cenário para testar a ramificação de 90 dias.',
            },
            {
              id: 'CQ2',
              formalTag: 'cq(cq2, valid_source(FRCP_12a1Aii_Foreign))',
              question: 'O prazo de 90 dias consta expressamente do texto normativo do formulário?',
              state: 'resolved_no_defeater',
              reason: 'Texto literal: "(or 90 days if it was sent outside the United States)".',
            },
            {
              id: 'CQ3',
              formalTag: 'cq(cq3, not excuses(E))',
              question: 'Há exceção derrotadora adicional?',
              state: 'resolved_no_defeater',
              reason: 'Sem escusa adicional registrada.',
            },
          ],
        },
      },
      {
        id: 'ao399_blank_pixels_only',
        label: 'Cenário 3 · Abstenção Estrita (Somente Pixels do Formulário em Branco)',
        partyCategory: 'formulario_em_branco_sem_estipulacao',
        conditionSummary:
          'Avaliando exclusivamente os pixels de ao399.png (sem estipular data de envio nem assinatura), o formulário está em branco: classifica-se o template, mas abstém-se de concluir obrigação concreta sobre parte real.',
        derivedDeadline: 'abstention_or_defeated',
        ruleSourceId: 'RULE_FRCP_4D3',
        ruleCitation: 'Protocolo INE410159 — Abstenção por lacuna probatória visual',
        verbalClassificationInstance: {
          premises: [
            {
              predicate: 'classified_as',
              args: ['DOC_AO399', 'blank_waiver_template_ao399'],
              source: 'IMG_AO399',
              role: 'ordinary',
            },
          ],
          conclusion: null,
          cqs: [
            {
              id: 'CQ1',
              question: 'Pode-se inferir obrigação processual concreta de um formulário não preenchido?',
              state: 'defeater_established',
              reason: 'Campos Plaintiff, Defendant, Date e Signature estão vazios nos pixels.',
            },
            {
              id: 'CQ2',
              question: 'O template impresso corresponde ao formulário oficial AO 399?',
              state: 'resolved_no_defeater',
              reason: 'Identificado no topo esquerdo como AO 399 (01/09).',
            },
          ],
        },
        establishedRuleInstance: {
          schemeId: 'established_rule',
          premises: [
            {
              predicate: 'general_rule',
              args: ['FRCP_4d3', 'signed_and_returned_waiver', 'deadline_60_or_90_days'],
              source: 'RULE_FRCP_4D3',
            },
          ],
          conclusion: null,
          cqs: [
            {
              id: 'CQ1',
              formalTag: 'cq(cq1, rule_applies(FRCP_4d3))',
              question: 'Há prova visual de que o réu recebeu e assinou o termo?',
              state: 'defeater_established',
              reason: 'Linha "Signature of the attorney or unrepresented party" está em branco.',
            },
            {
              id: 'CQ2',
              formalTag: 'cq(cq2, valid_source(FRCP_4d3))',
              question: 'O texto da regra está visível no documento?',
              state: 'resolved_no_defeater',
              reason: 'Sim, impresso nos parágrafos centrais e no rodapé.',
            },
            {
              id: 'CQ3',
              formalTag: 'cq(cq3, not excuses(E))',
              question: 'Existe exceção ou ausência de pressuposto factual?',
              state: 'defeater_established',
              reason: 'Abstenção obrigatória: formulário em branco não cria vínculo processual.',
            },
          ],
        },
      },
    ],
  },
  {
    caseId: 'CASE03',
    formCode: 'AO 440',
    formTitle: 'Summons in a Civil Action',
    revisionDate: 'Rev. 06/12',
    primaryRules: ['Fed. R. Civ. P. 4(a)-(l)', 'Fed. R. Civ. P. 12(a)(1)(A)(i)', 'Fed. R. Civ. P. 12(a)(2)-(3)'],
    summary:
      'Mandado de citação em ação civil ordinária (2 páginas). A Página 1 fixa o prazo de 21 dias após a citação (ou 60 dias se o réu for os Estados Unidos, agência ou oficial federal sob a Regra 12(a)(2) ou (3)). A Página 2 contém o formulário de Proof of Service sob a Regra 4(l).',
    pages: [
      {
        pageNumber: 1,
        title: 'Página 1 · AO 440 (Rev. 06/12) Summons in a Civil Action',
        regions: [
          {
            id: 'ao440_header',
            label: 'Identificador Paratextual (AO 440 Rev. 06/12)',
            coords: [0.05, 0.04, 0.45, 0.08],
            color: '#146563',
            extractedText: 'AO 440 (Rev. 06/12) Summons in a Civil Action',
            schemeRole: 'classified_as(DOC, form_ao440_civil_summons)',
            epistemicNote: 'Identifica a versão revisada em 06/2012 (pós-reforma de prazos de 2009 para 21 dias).',
          },
          {
            id: 'ao440_deadline_21_60',
            label: 'Regra de Prazo: 21 Dias (Ordinário) vs. 60 Dias (EUA / Agência / Oficial)',
            coords: [0.06, 0.54, 0.94, 0.65],
            color: '#8d550b',
            extractedText:
              'Within 21 days after service of this summons on you (not counting the day you received it) — or 60 days if you are the United States or a United States agency, or an officer or employee of the United States described in Fed. R. Civ. P. 12 (a)(2) or (3) — you must serve on the plaintiff an answer...',
            schemeRole: 'established_rule(FRCP_12a, 21_days | 60_days_us_gov)',
            epistemicNote:
              'Explicita tanto a contagem com exclusão do dia do recebimento (Regra 6(a)) quanto a distinção subjetiva entre réu comum (21d) e ente federal (60d).',
          },
          {
            id: 'ao440_default_warning',
            label: 'Consequência Normativa de Revelia (Default Judgment)',
            coords: [0.06, 0.71, 0.94, 0.77],
            color: '#7c3aed',
            extractedText:
              'If you fail to respond, judgment by default will be entered against you for the relief demanded in the complaint.',
            schemeRole: 'normative_sanction(failure_to_respond, default_judgment)',
            epistemicNote: 'Consequência prevista na Fed. R. Civ. P. 55.',
          },
          {
            id: 'ao440_clerk_sig',
            label: 'Bloco Institucional (CLERK OF COURT)',
            coords: [0.54, 0.79, 0.94, 0.89],
            color: '#1d4ed8',
            extractedText: 'CLERK OF COURT | Signature of Clerk or Deputy Clerk',
            schemeRole: 'institutional_validity_condition(clerk_signature)',
            epistemicNote: 'Requisito formal de validade da citação sob a Fed. R. Civ. P. 4(a)(1)(F).',
          },
        ],
        blocks: [
          {
            id: 'p1_b1',
            coords: [0.06, 0.04, 0.94, 0.12],
            heading: 'AO 440 (Rev. 06/12) Summons in a Civil Action',
            content: 'UNITED STATES DISTRICT COURT · Plaintiff(s) v. Defendant(s) · Civil Action No.',
          },
          {
            id: 'p1_b2',
            coords: [0.06, 0.54, 0.94, 0.65],
            heading: 'SUMMONS IN A CIVIL ACTION — Cláusula de Prazo (21 vs. 60 dias)',
            content:
              'Within 21 days after service of this summons on you (not counting the day you received it) — or 60 days if you are the United States or a United States agency, or an officer or employee of the United States described in Fed. R. Civ. P. 12 (a)(2) or (3) — you must serve on the plaintiff an answer to the attached complaint or a motion under Rule 12.',
          },
          {
            id: 'p1_b3',
            coords: [0.06, 0.71, 0.94, 0.88],
            heading: 'Advertência de Revelia e Assinatura do Escrivão',
            content:
              'If you fail to respond, judgment by default will be entered against you for the relief demanded in the complaint. | CLERK OF COURT — Signature of Clerk or Deputy Clerk',
          },
        ],
      },
      {
        pageNumber: 2,
        title: 'Página 2 · AO 440 (Rev. 06/12) Proof of Service (Fed. R. Civ. P. 4(l))',
        regions: [
          {
            id: 'ao440_p2_header',
            label: 'Cabeçalho Proof of Service (Fed. R. Civ. P. 4(l))',
            coords: [0.06, 0.05, 0.94, 0.16],
            color: '#146563',
            extractedText:
              'PROOF OF SERVICE (This section should not be filed with the court unless required by Fed. R. Civ. P. 4 (l))',
            schemeRole: 'classified_as(PAGE2, proof_of_service_declaration)',
            epistemicNote: 'Conecta a eficácia do prazo da Página 1 à comprovação material da citação.',
          },
          {
            id: 'ao440_p2_checkboxes',
            label: 'Modalidades de Citação (Pessoal, Domicílio, Agente, Não Executada)',
            coords: [0.1, 0.21, 0.94, 0.52],
            color: '#8d550b',
            extractedText:
              '[ ] Personally served | [ ] Left at residence/abode with person of suitable age and discretion + mailed | [ ] Served on designated agent | [ ] Returned unexecuted | [ ] Other',
            schemeRole: 'service_modality_alternatives(FRCP_4e_4h)',
            epistemicNote:
              'Se a 4ª opção ("returned unexecuted") for marcada, derrota-se o início do prazo de 21/60 dias (CQ3 em Established Rule).',
          },
          {
            id: 'ao440_p2_perjury',
            label: 'Declaração sob Pena de Perjúrio e Taxas ($0.00)',
            coords: [0.1, 0.54, 0.94, 0.74],
            color: '#1d4ed8',
            extractedText:
              'My fees are $___ for travel and $___ for services, for a total of $ 0.00. I declare under penalty of perjury that this information is true. Server’s signature.',
            schemeRole: 'truthfulness_assumption(Server, ServiceStatement)',
            epistemicNote: 'Conecta o documento ao esquema de Testemunho / Declaração juramentada.',
          },
        ],
        blocks: [
          {
            id: 'p2_b1',
            coords: [0.06, 0.05, 0.94, 0.16],
            heading: 'AO 440 (Page 2) · PROOF OF SERVICE',
            content: '(This section should not be filed with the court unless required by Fed. R. Civ. P. 4 (l))',
          },
          {
            id: 'p2_b2',
            coords: [0.1, 0.21, 0.94, 0.52],
            heading: 'Modalidades de Cumprimento do Mandado',
            content:
              '☐ I personally served the summons on the individual | ☐ I left the summons at the individual’s residence or usual place of abode | ☐ I served the summons on designated agent | ☐ I returned the summons unexecuted',
          },
          {
            id: 'p2_b3',
            coords: [0.06, 0.94, 0.94, 0.98],
            content: 'Controles AcroForm:',
            isParatextButtonBar: true,
            buttons: ['Print', 'Save As...', 'Reset'],
          },
        ],
      },
    ],
    scenarios: [
      {
        id: 'ao440_21d_ordinary',
        label: 'Cenário 1 · Prazo Ordinário de 21 Dias (Réu Privado Citado — Regra 12(a)(1)(A)(i))',
        partyCategory: 'reu_privado_citado_pessoalmente',
        conditionSummary:
          'Classifica o documento como AO 440; estipula-se citação válida de réu privado (não estatal) na Página 2, derivando o prazo derrotável de 21 dias.',
        derivedDeadline: '21_days',
        ruleSourceId: 'RULE_FRCP_12A1Ai',
        ruleCitation: 'Fed. R. Civ. P. 12(a)(1)(A)(i)',
        verbalClassificationInstance: {
          premises: [
            {
              predicate: 'classified_as',
              args: ['DOC_AO440', 'civil_summons_ordinary_defendant'],
              source: 'IMG_AO440 + STIPULATED_CONTEXT',
              role: 'ordinary',
            },
            {
              predicate: 'classification_warrant',
              args: ['civil_summons_ordinary_defendant', 'deadline_21_days_after_service'],
              source: 'RULE_FRCP_12A1Ai',
              role: 'ordinary',
            },
          ],
          conclusion: {
            predicate: 'has_property',
            args: ['DOC_AO440', 'deadline_21_days_after_service'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              question: 'O réu enquadra-se na exceção de 60 dias para entes/oficiais dos EUA?',
              state: 'resolved_no_defeater',
              reason: 'Estipulado réu privado comum; não se aplica a Regra 12(a)(2)-(3).',
            },
            {
              id: 'CQ2',
              question: 'O formulário é inequivocamente um mandado AO 440?',
              state: 'resolved_no_defeater',
              reason: 'Cabeçalho AO 440 (Rev. 06/12) Summons in a Civil Action verificado.',
            },
          ],
        },
        establishedRuleInstance: {
          schemeId: 'established_rule',
          premises: [
            {
              predicate: 'general_rule',
              args: ['FRCP_12a1Ai', 'served_civil_summons_non_federal_party', 'serve_answer_within_21_days'],
              source: 'RULE_FRCP_12A1Ai',
            },
            {
              predicate: 'satisfies_condition',
              args: ['Defendant_Private', 'served_civil_summons_non_federal_party'],
              source: 'IMG_AO440 + STIPULATED_CONTEXT',
            },
          ],
          conclusion: {
            predicate: 'deontic_obligation',
            args: ['Defendant_Private', 'serve_answer_within_21_days'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              formalTag: 'cq(cq1, rule_applies(FRCP_12a1Ai))',
              question: 'A regra de 21 dias aplica-se após exclusão do dia do recebimento?',
              state: 'resolved_no_defeater',
              reason: 'Texto expresso: "Within 21 days after service of this summons on you (not counting the day you received it)".',
            },
            {
              id: 'CQ2',
              formalTag: 'cq(cq2, valid_source(FRCP_12a1Ai))',
              question: 'A fonte normativa está identificada no texto do mandado?',
              state: 'resolved_no_defeater',
              reason: 'Citada expressamente como Rule 12 of the Federal Rules of Civil Procedure.',
            },
            {
              id: 'CQ3',
              formalTag: 'cq(cq3, not excuses(E))',
              question: 'O mandado foi devolvido sem cumprimento ("returned unexecuted") na Página 2?',
              state: 'resolved_no_defeater',
              reason: 'Estipulada citação cumprida; sem derrotador de falta de citação.',
            },
          ],
        },
      },
      {
        id: 'ao440_60d_us_agency',
        label: 'Cenário 2 · Prazo de 60 Dias (EUA, Agência ou Oficial Federal — Regra 12(a)(2)-(3))',
        partyCategory: 'estados_unidos_agencia_ou_oficial_federal',
        conditionSummary:
          'Quando o réu citado no AO 440 é os Estados Unidos, agência federal ou oficial/empregado federal descrito na Fed. R. Civ. P. 12(a)(2) ou (3), aplica-se o prazo de 60 dias.',
        derivedDeadline: '60_days',
        ruleSourceId: 'RULE_FRCP_12A2_3',
        ruleCitation: 'Fed. R. Civ. P. 12(a)(2) & 12(a)(3)',
        verbalClassificationInstance: {
          premises: [
            {
              predicate: 'classified_as',
              args: ['DOC_AO440', 'civil_summons_us_government_defendant'],
              source: 'IMG_AO440 + STIPULATED_CONTEXT',
              role: 'ordinary',
            },
            {
              predicate: 'classification_warrant',
              args: ['civil_summons_us_government_defendant', 'deadline_60_days_after_service'],
              source: 'RULE_FRCP_12A2_3',
              role: 'ordinary',
            },
          ],
          conclusion: {
            predicate: 'has_property',
            args: ['DOC_AO440', 'deadline_60_days_after_service'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              question: 'A qualificação subjetiva de ente/oficial dos EUA está prevista no mandado?',
              state: 'resolved_no_defeater',
              reason: 'Prevista literalmente nas linhas 2–3 do segundo parágrafo do AO 440.',
            },
            {
              id: 'CQ2',
              question: 'Os pixels sozinhos identificam qual agência foi citada?',
              state: 'unknown',
              reason: 'O campo Defendant(s) está em branco na imagem; a condição subjetiva vem do cenário estipulado.',
            },
          ],
        },
        establishedRuleInstance: {
          schemeId: 'established_rule',
          premises: [
            {
              predicate: 'general_rule',
              args: ['FRCP_12a2_3', 'served_us_agency_or_officer', 'serve_answer_within_60_days'],
              source: 'RULE_FRCP_12A2_3',
            },
            {
              predicate: 'satisfies_condition',
              args: ['Defendant_US_Agency', 'served_us_agency_or_officer'],
              source: 'IMG_AO440 + STIPULATED_CONTEXT',
            },
          ],
          conclusion: {
            predicate: 'deontic_obligation',
            args: ['Defendant_US_Agency', 'serve_answer_within_60_days'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              formalTag: 'cq(cq1, rule_applies(FRCP_12a2_3))',
              question: 'O réu satisfaz os requisitos da Fed. R. Civ. P. 12(a)(2) ou (3)?',
              state: 'resolved_no_defeater',
              reason: 'Satisfeito por estipulação do cenário para ente/oficial federal.',
            },
            {
              id: 'CQ2',
              formalTag: 'cq(cq2, valid_source(FRCP_12a2_3))',
              question: 'A regra de 60 dias tem citação normativa explícita na página 1?',
              state: 'resolved_no_defeater',
              reason: 'Citação textual: "described in Fed. R. Civ. P. 12 (a)(2) or (3)".',
            },
            {
              id: 'CQ3',
              formalTag: 'cq(cq3, not excuses(E))',
              question: 'Existe defeito na citação do U.S. Attorney sob a Regra 4(i)?',
              state: 'resolved_no_defeater',
              reason: 'Assumida citação regular para fins do oráculo.',
            },
          ],
        },
      },
      {
        id: 'ao440_unexecuted_defeated',
        label: 'Cenário 3 · Derrota por Mandado Não Executado (Página 2: "returned unexecuted")',
        partyCategory: 'mandado_devolvido_sem_cumprimento',
        conditionSummary:
          'Se na Página 2 (Proof of Service) estiver assinalado "I returned the summons unexecuted", a condição de citação falha e a obrigação de responder em 21/60 dias não nasce.',
        derivedDeadline: 'abstention_or_defeated',
        ruleSourceId: 'RULE_FRCP_4L',
        ruleCitation: 'Fed. R. Civ. P. 4(l) & 12(a)(1)(A)',
        verbalClassificationInstance: {
          premises: [
            {
              predicate: 'classified_as',
              args: ['DOC_AO440_P2', 'unexecuted_summons_return'],
              source: 'IMG_AO440_P2 + STIPULATED_CONTEXT',
              role: 'ordinary',
            },
          ],
          conclusion: null,
          cqs: [
            {
              id: 'CQ1',
              question: 'O prazo de 21 dias corre quando o mandado é devolvido sem execução?',
              state: 'defeater_established',
              reason: 'A Regra 12 exige "after service of this summons on you"; sem service, não há prazo.',
            },
            {
              id: 'CQ2',
              question: 'A opção de devolução sem execução existe visualmente na Página 2?',
              state: 'resolved_no_defeater',
              reason: '4ª caixa de seleção da Página 2: "I returned the summons unexecuted because...".',
            },
          ],
        },
        establishedRuleInstance: {
          schemeId: 'established_rule',
          premises: [
            {
              predicate: 'general_rule',
              args: ['FRCP_12a', 'valid_service_completed', 'serve_answer_within_21_or_60_days'],
              source: 'RULE_FRCP_12A1Ai',
            },
          ],
          conclusion: null,
          cqs: [
            {
              id: 'CQ1',
              formalTag: 'cq(cq1, rule_applies(FRCP_12a))',
              question: 'O antecedente "service of this summons" ocorreu?',
              state: 'defeater_established',
              reason: 'Refutado pelo registro de "returned unexecuted" na Página 2.',
            },
            {
              id: 'CQ2',
              formalTag: 'cq(cq2, valid_source(FRCP_12a))',
              question: 'A exigência de prova de serviço decorre da Regra 4(l)?',
              state: 'resolved_no_defeater',
              reason: 'Cabeçalho da Página 2 cita expressamente Fed. R. Civ. P. 4(l).',
            },
            {
              id: 'CQ3',
              formalTag: 'cq(cq3, not excuses(unexecuted_service))',
              question: 'A ausência de citação escusa o réu do prazo de resposta?',
              state: 'defeater_established',
              reason: 'Escusa absoluta: sem citação válida ou waiver, não corre prazo para revelia.',
            },
          ],
        },
      },
    ],
  },
  {
    caseId: 'CASE04',
    formCode: 'AO 441',
    formTitle: 'Summons on a Third-Party Complaint',
    revisionDate: 'Rev. 07/10',
    primaryRules: ['Fed. R. Civ. P. 14(a)', 'Fed. R. Civ. P. 12(a)(1)-(3)', 'Fed. R. Civ. P. 4(l)'],
    summary:
      'Mandado de citação em denunciação da lide / ação regressiva contra terceiro (Third-Party Complaint, 2 páginas). Exige que o Third-Party Defendant sirva resposta tanto ao autor original (Plaintiff) quanto ao réu/autor-terceiro (Defendant, Third-party plaintiff) em 21 ou 60 dias, enquanto a resposta à petição inicial original do autor é facultativa ("may – but are not required to – respond to it").',
    pages: [
      {
        pageNumber: 1,
        title: 'Página 1 · AO 441 (Rev. 07/10) Summons on a Third-Party Complaint',
        regions: [
          {
            id: 'ao441_header',
            label: 'Identificador Paratextual (AO 441 Rev. 07/10)',
            coords: [0.05, 0.04, 0.48, 0.08],
            color: '#146563',
            extractedText: 'AO 441 (Rev. 07/10) Summons on Third-Party Complaint',
            schemeRole: 'classified_as(DOC, form_ao441_third_party_summons)',
            epistemicNote: 'Distingue visualmente a citação de terceiro (Regra 14) da citação civil simples (AO 440).',
          },
          {
            id: 'ao441_tripartite_caption',
            label: 'Estrutura Tripartite de Partes (Plaintiff / Third-Party Plaintiff / Third-Party Defendant)',
            coords: [0.05, 0.16, 0.52, 0.31],
            color: '#1d4ed8',
            extractedText: 'Plaintiff v. Defendant, Third-party plaintiff v. Third-party defendant',
            schemeRole: 'party_structure(tripartite_rule14)',
            epistemicNote: 'Evidência estrutural visual de relação processual trilateral.',
          },
          {
            id: 'ao441_dual_service_21_60',
            label: 'Obrigação Dupla de Serviço em 21 ou 60 Dias (Ao Plaintiff E ao Defendant)',
            coords: [0.06, 0.51, 0.94, 0.68],
            color: '#8d550b',
            extractedText:
              'Within 21 days after service of this summons on you ... — or 60 days if you are the United States or a United States agency, or an officer or employee ... — you must serve on the plaintiff and on the defendant an answer to the attached complaint or a motion under Rule 12...',
            schemeRole: 'established_rule(FRCP_14a2_12a, dual_service_21_or_60_days)',
            epistemicNote:
              'Diferença crucial em relação ao AO 440: o terceiro réu deve servir a resposta tanto ao defendant/third-party plaintiff quanto ao plaintiff original.',
          },
          {
            id: 'ao441_optional_plaintiff_complaint',
            label: 'Cláusula Deôntica Facultativa quanto à Petição Original ("may – but are not required to")',
            coords: [0.06, 0.76, 0.92, 0.8],
            color: '#7c3aed',
            extractedText:
              'A copy of the plaintiff’s complaint is also attached. You may – but are not required to – respond to it.',
            schemeRole: 'deontic_permission_not_obligation(respond_to_original_plaintiff_complaint)',
            epistemicNote:
              'Excelente teste para evitar falso positivo de obrigação deôntica: responder à third-party complaint é obrigatório (must), mas responder à plaintiff’s complaint anexa é facultativo (may).',
          },
        ],
        blocks: [
          {
            id: 'p1_b1',
            coords: [0.06, 0.04, 0.94, 0.31],
            heading: 'AO 441 (Rev. 07/10) Summons on Third-Party Complaint',
            content: 'Plaintiff v. Defendant, Third-party plaintiff v. Third-party defendant · Civil Action No.',
          },
          {
            id: 'p1_b2',
            coords: [0.06, 0.51, 0.94, 0.68],
            heading: 'Obrigação de Resposta em 21 / 60 Dias com Duplo Destinatário',
            content:
              'Within 21 days after service of this summons on you — or 60 days if you are the United States or a United States agency, or an officer or employee described in Fed. R. Civ. P. 12(a)(2) or (3) — you must serve on the plaintiff and on the defendant an answer to the attached complaint or a motion under Rule 12.',
          },
          {
            id: 'p1_b3',
            coords: [0.06, 0.76, 0.94, 0.81],
            heading: 'Distinção Deôntica (Obrigatório vs. Facultativo)',
            content:
              'A copy of the plaintiff’s complaint is also attached. You may – but are not required to – respond to it.',
          },
        ],
      },
      {
        pageNumber: 2,
        title: 'Página 2 · AO 441 (Rev. 07/10) Proof of Service + Add Attachment',
        regions: [
          {
            id: 'ao441_p2_header',
            label: 'Cabeçalho AO 441 (Page 2) · Proof of Service',
            coords: [0.06, 0.05, 0.94, 0.16],
            color: '#146563',
            extractedText: 'AO 441 (Rev. 07/10) Summons on Third-Party Complaint (Page 2) · PROOF OF SERVICE',
            schemeRole: 'classified_as(PAGE2, third_party_proof_of_service)',
            epistemicNote: 'Página 2 do AO 441 com estrutura idêntica da Regra 4(l), exceto pela barra inferior.',
          },
          {
            id: 'ao441_p2_buttons',
            label: 'Barra Paratextual com 4 Botões (Inclui "Add Attachment")',
            coords: [0.05, 0.94, 0.95, 0.98],
            color: '#b45309',
            extractedText: '[Print] [Save As...] [Add Attachment] [Reset]',
            schemeRole: 'paratext_affordance(add_attachment_button)',
            epistemicNote:
              'Diferença visual observável nos pixels entre a Página 2 do AO 440 (3 botões) e a Página 2 do AO 441 (4 botões, incluindo "Add Attachment").',
          },
        ],
        blocks: [
          {
            id: 'p2_b1',
            coords: [0.06, 0.05, 0.94, 0.16],
            heading: 'AO 441 (Rev. 07/10) Page 2 · PROOF OF SERVICE',
            content: 'Modalidades de serviço sob Fed. R. Civ. P. 4(l) e declaração sob pena de perjúrio.',
          },
          {
            id: 'p2_b2',
            coords: [0.05, 0.94, 0.95, 0.98],
            content: 'Controles AcroForm (4 botões na Página 2 do AO 441):',
            isParatextButtonBar: true,
            buttons: ['Print', 'Save As...', 'Add Attachment', 'Reset'],
          },
        ],
      },
    ],
    scenarios: [
      {
        id: 'ao441_21d_third_party',
        label: 'Cenário 1 · Prazo de 21 Dias com Duplo Serviço Obrigatório (Regra 14 + Regra 12)',
        partyCategory: 'terceiro_reu_privado_citado',
        conditionSummary:
          'Classifica o formulário como AO 441; deriva o dever derrotável do Third-Party Defendant de responder à third-party complaint em 21 dias, servindo tanto ao Defendant quanto ao Plaintiff.',
        derivedDeadline: '21_days',
        ruleSourceId: 'RULE_FRCP_14A_12A',
        ruleCitation: 'Fed. R. Civ. P. 14(a)(2)(A) & 12(a)(1)(A)(i)',
        verbalClassificationInstance: {
          premises: [
            {
              predicate: 'classified_as',
              args: ['DOC_AO441', 'third_party_summons_ordinary'],
              source: 'IMG_AO441 + STIPULATED_CONTEXT',
              role: 'ordinary',
            },
            {
              predicate: 'classification_warrant',
              args: ['third_party_summons_ordinary', 'dual_service_answer_within_21_days'],
              source: 'RULE_FRCP_14A_12A',
              role: 'ordinary',
            },
          ],
          conclusion: {
            predicate: 'has_property',
            args: ['DOC_AO441', 'dual_service_answer_within_21_days'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              question: 'O terceiro réu é obrigado a responder também à petição inicial original do Plaintiff?',
              state: 'resolved_no_defeater',
              reason: 'Não: o texto distingue a obrigação quanto à third-party complaint da permissão facultativa quanto à plaintiff’s complaint.',
            },
            {
              id: 'CQ2',
              question: 'Há elementos visuais exclusivos que distinguem o AO 441 do AO 440?',
              state: 'resolved_no_defeater',
              reason: 'Cabeçalho AO 441, caption tripartite, exigência de duplo serviço e botão Add Attachment na pág. 2.',
            },
          ],
        },
        establishedRuleInstance: {
          schemeId: 'established_rule',
          premises: [
            {
              predicate: 'general_rule',
              args: ['FRCP_14a2A', 'served_third_party_defendant_private', 'serve_answer_on_plaintiff_and_defendant_within_21_days'],
              source: 'RULE_FRCP_14A_12A',
            },
            {
              predicate: 'satisfies_condition',
              args: ['ThirdPartyDefendant_T', 'served_third_party_defendant_private'],
              source: 'IMG_AO441 + STIPULATED_CONTEXT',
            },
          ],
          conclusion: {
            predicate: 'deontic_obligation',
            args: ['ThirdPartyDefendant_T', 'serve_answer_on_plaintiff_and_defendant_within_21_days'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              formalTag: 'cq(cq1, rule_applies(FRCP_14a2A))',
              question: 'A regra de 21 dias com duplo destinatário aplica-se ao terceiro réu privado?',
              state: 'resolved_no_defeater',
              reason: 'Sim, conforme texto expresso do 2º parágrafo do AO 441.',
            },
            {
              id: 'CQ2',
              formalTag: 'cq(cq2, valid_source(FRCP_14a2A))',
              question: 'A modalidade deôntica ("must serve" vs "may respond") foi preservada sem confusão?',
              state: 'resolved_no_defeater',
              reason: 'A conclusão restringe-se à third-party complaint obrigatória.',
            },
            {
              id: 'CQ3',
              formalTag: 'cq(cq3, not excuses(E))',
              question: 'O terceiro réu é ente/oficial dos EUA (60 dias) ou houve falha na citação?',
              state: 'resolved_no_defeater',
              reason: 'Estipulado terceiro réu privado regularmente citado.',
            },
          ],
        },
      },
      {
        id: 'ao441_60d_federal_third_party',
        label: 'Cenário 2 · Prazo de 60 Dias (Terceiro Réu é Agência/Oficial dos EUA — Regra 12(a)(2)-(3))',
        partyCategory: 'terceiro_reu_ente_ou_oficial_federal',
        conditionSummary:
          'Quando o Third-Party Defendant é os Estados Unidos, agência ou oficial federal, o prazo na denunciação da lide passa a 60 dias.',
        derivedDeadline: '60_days',
        ruleSourceId: 'RULE_FRCP_12A2_3',
        ruleCitation: 'Fed. R. Civ. P. 14(a)(2)(A) c/c 12(a)(2)-(3)',
        verbalClassificationInstance: {
          premises: [
            {
              predicate: 'classified_as',
              args: ['DOC_AO441', 'third_party_summons_us_government'],
              source: 'IMG_AO441 + STIPULATED_CONTEXT',
              role: 'ordinary',
            },
            {
              predicate: 'classification_warrant',
              args: ['third_party_summons_us_government', 'dual_service_answer_within_60_days'],
              source: 'RULE_FRCP_12A2_3',
              role: 'ordinary',
            },
          ],
          conclusion: {
            predicate: 'has_property',
            args: ['DOC_AO441', 'dual_service_answer_within_60_days'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              question: 'A ressalva de 60 dias consta também do formulário AO 441?',
              state: 'resolved_no_defeater',
              reason: 'Sim, linhas 1–3 do segundo parágrafo do AO 441.',
            },
            {
              id: 'CQ2',
              question: 'A qualificação como ente federal provém dos pixels ou do contexto estipulado?',
              state: 'unknown',
              reason: 'Os campos de nome estão em branco na imagem; a qualificação vem do cenário estipulado.',
            },
          ],
        },
        establishedRuleInstance: {
          schemeId: 'established_rule',
          premises: [
            {
              predicate: 'general_rule',
              args: ['FRCP_12a2_3_TP', 'third_party_defendant_is_us_entity', 'serve_answer_within_60_days'],
              source: 'RULE_FRCP_12A2_3',
            },
            {
              predicate: 'satisfies_condition',
              args: ['ThirdParty_US_Officer', 'third_party_defendant_is_us_entity'],
              source: 'IMG_AO441 + STIPULATED_CONTEXT',
            },
          ],
          conclusion: {
            predicate: 'deontic_obligation',
            args: ['ThirdParty_US_Officer', 'serve_answer_within_60_days'],
            modality: 'defeasible',
          },
          cqs: [
            {
              id: 'CQ1',
              formalTag: 'cq(cq1, rule_applies(FRCP_12a2_3_TP))',
              question: 'A regra especial de 60 dias sobrepõe-se ao prazo geral de 21 dias?',
              state: 'resolved_no_defeater',
              reason: 'Sim, por cláusula expressa "or 60 days if you are the United States...".',
            },
            {
              id: 'CQ2',
              formalTag: 'cq(cq2, valid_source(FRCP_12a2_3_TP))',
              question: 'A fonte normativa é citada literalmente no documento?',
              state: 'resolved_no_defeater',
              reason: 'Citada como Fed. R. Civ. P. 12(a)(2) or (3).',
            },
            {
              id: 'CQ3',
              formalTag: 'cq(cq3, not excuses(E))',
              question: 'Há outra escusa aplicável?',
              state: 'resolved_no_defeater',
              reason: 'Nenhuma escusa adicional no cenário.',
            },
          ],
        },
      },
    ],
  },
];

export const QUICK_FRCP_GROUNDING_QUERIES = [
  {
    id: 'q_frcp4d',
    label: 'FRCP 4(d) · Waiver of Service (60 vs. 90 dias e Good Cause)',
    formCode: 'AO 399 (01/09)',
    query:
      'Explique os requisitos da Federal Rule of Civil Procedure 4(d) aplicáveis ao formulário AO 399 Waiver of Service of Summons, incluindo a diferença entre o prazo de 60 dias e 90 dias, o dever de evitar custos desnecessários, o que não constitui good cause e quais defesas são preservadas.',
  },
  {
    id: 'q_frcp12a',
    label: 'FRCP 12(a)(1)–(3) · Prazos de 21 vs. 60 dias (AO 440)',
    formCode: 'AO 440 (Rev. 06/12)',
    query:
      'Analise os prazos de resposta da Federal Rule of Civil Procedure 12(a)(1)(A)(i), 12(a)(2) e 12(a)(3) refletidos no formulário AO 440 Summons in a Civil Action (21 dias para réu comum vs 60 dias para os Estados Unidos, agências e oficiais federais) e a regra de prova de citação na Rule 4(l).',
  },
  {
    id: 'q_frcp14a',
    label: 'FRCP 14(a) · Third-Party Summons e Duplo Serviço (AO 441)',
    formCode: 'AO 441 (Rev. 07/10)',
    query:
      'Explique a disciplina da Federal Rule of Civil Procedure 14(a)(2) no formulário AO 441 Summons on a Third-Party Complaint: por que a resposta à third-party complaint é obrigatória em 21 ou 60 dias (servida ao autor e ao réu), enquanto responder à petição original do autor é facultativo?',
  },
];

export const QUICK_OPENALEX_TOPICS = [
  {
    id: 'oa_walton',
    label: 'Argumentation Schemes & Legal Reasoning (Walton / Gordon)',
    query: 'argumentation schemes legal reasoning Douglas Walton Thomas Gordon',
  },
  {
    id: 'oa_defeasible',
    label: 'Defeasible Logic & Statutory Rules in Law',
    query: 'defeasible logic legal rules exceptions argumentation Prakken Sartor',
  },
  {
    id: 'oa_cbr',
    label: 'Legal Case-Based Reasoning & Precedent (Bench-Capon)',
    query: 'argument schemes legal case-based reasoning Bench-Capon Wyner',
  },
  {
    id: 'oa_visual',
    label: 'Visual Argumentation & Multimodal Evidence in Law',
    query: 'visual argumentation multimodal evidence legal reasoning',
  },
];
