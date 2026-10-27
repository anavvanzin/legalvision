import { IconocraciaScopeType, IconocraciaSupportType } from '../firebase';

export interface IconocraciaCvRegion {
  id: string;
  label: string;
  coords: [number, number, number, number]; // [x1, y1, x2, y2] in [0,1]
  color: string;
  preIconographic: string;
  iconographicAttribute: string;
  iconologicalReading: string;
  indiciaryRole: string;
}

export interface IconocraciaExemplarCase {
  id: string;
  itemCode: string;
  title: string;
  supportType: IconocraciaSupportType;
  supportLabel: string;
  chronologyYear: number;
  jurisdiction: string;
  scopeClassification: IconocraciaScopeType;
  provenanceArchive: string;
  rightsStatus: string;
  visualAttributes: string[];
  stateMeaningProduced: string;
  historicalReceptionBoundary: string;
  silenceDeclaration: string;
  iconoclasticConflictNote: string;
  regions: IconocraciaCvRegion[];
}

export interface CourseScheduleMilestone {
  id: string;
  date: string;
  phaseLabel: string;
  title: string;
  deliverables: string[];
  verificationStatus: 'documentado_local' | 'em_preparacao' | 'pendente_entrega_final';
  epistemicBoundary: string;
  linkedRepositoryPath: string;
}

export interface AbntReferenceItem {
  id: string;
  citationAbnt2025: string;
  methodologicalRole: string;
}

export const ICONOCRACIA_CV_PROJECT_LINKS = {
  cvRepoUrl: 'https://github.com/anavvanzin/iconocracia-cv',
  cvSpecDocUrl:
    'https://github.com/anavvanzin/iconocracia-cv/blob/main/docs/projeto-disciplina-visao-computacional-2026-2.md',
  companionUrl: 'https://iconocracia-companion.warholana.workers.dev/',
  atlasUrl: 'https://www.perplexity.ai/computer/a/iconocracia-atlas-7saKqNyZTLCkLkFNF.tbOw',
  corpusRepoUrl: 'https://github.com/anavvanzin/iconocracy-corpus',
  legalVisualRepoUrl: 'https://github.com/anavvanzin/legal-visual-argumentation',
};

export const STABLE_VOCABULARY_GLOSSARY: Array<{
  term: string;
  definition: string;
  cvOperationalization: string;
}> = [
  {
    term: 'iconocracia / regime iconocrático',
    definition:
      'Governo do visível pelo qual dispositivos estatais e jurídicos organizam, distribuem e estabilizam soberania, legitimidade e memória institucional por meio de imagens.',
    cvOperationalization:
      'Tipologia analítica construída por leitura densa de casos exemplares (nunca por clusterização automática ou análise fatorial de embeddings).',
  },
  {
    term: 'alegoria feminina / personificação feminina',
    definition:
      'Figuração corpórea feminina que encarna conceitos jurídico-políticos (Justiça, Liberdade, República/Marianne, Britânia, Hispânia) em suportes oficiais.',
    cvOperationalization:
      'Detecção assistida de regiões corpóreas e vestimentas em coordenadas normalizadas [0,1] para alimentar o catálogo documentado.',
  },
  {
    term: 'feminilidade de Estado & reconhecimento sem reciprocidade',
    definition:
      'Paradoxo constitutivo da modernidade jurídica oitocentista e novecentista: hipervisibilidade simbólica de corpos femininos alegóricos combinada à exclusão civil e política de mulheres reais.',
    cvOperationalization:
      'Confronto entre o paratexto normativo/suporte estatal inspecionado e o regime constitucional vigente na data do item (1800–2000).',
  },
  {
    term: 'iconoclasmo / conflito de imagens & purificação simbólica',
    definition:
      'Disputas materiais ou visuais (vandalização, remoção, protesto, recorte ou domesticação estética) sobre monumentos e alegorias estatais, incluindo a hipótese de iconocracia/iconoclasmo tropical.',
    cvOperationalization:
      'Registro separado entre indício visual observado na superfície (marcas, pichações, ausências de atributos) e contexto probatório externo, sem inferir autoria, culpa ou intenção por aparência.',
  },
  {
    term: 'corpus core vs. comparador / apêndice',
    definition:
      'Janela cronológica estrita de 1800–2000 em moedas, selos, brasões, monumentos, arquitetura forense e paratextos normativos compõe o corpus core; itens fora desse recorte vão para comparador/apêndice.',
    cvOperationalization:
      'Filtro obrigatório na catalogação: itens em comparador/apêndice exigem justificativa explícita e jamais entram nas contagens do corpus core.',
  },
  {
    term: 'iconografia / iconologia (sentido panofskiano)',
    definition:
      'Articulação em três níveis: descrição pré-iconográfica (formas e objetos visíveis), análise iconográfica (identificação de atributos convencionais) e interpretação iconológica (sintoma cultural e jurídico).',
    cvOperationalization:
      'O modelo ou detector de visão computacional atua estritamente como auxílio nos níveis 1 e 2; o nível 3 é prerrogativa exclusiva da leitura histórico-jurídica.',
  },
];

export const ICONOCRACIA_EXEMPLAR_CASES: IconocraciaExemplarCase[] = [
  {
    id: 'EXEMPLAR_01',
    itemCode: 'ICON-BR-1889-REP-01',
    title: 'Alegoria da República com Barrete Frígio em Emissão Oficial Pós-Proclamação (Brasil, 1889–1891)',
    supportType: 'moeda',
    supportLabel: 'Moeda / Numismática Estatal e Selo Oficial',
    chronologyYear: 1890,
    jurisdiction: 'Brasil Pós-Colonial (Primeira República)',
    scopeClassification: 'corpus_core',
    provenanceArchive:
      'Catálogo Documentado Iconocracy-Corpus · Acervo Numismático Público / Museu de Valores do Banco Central (ref. série 1889–1891)',
    rightsStatus: 'Domínio público (emissão estatal histórica anterior a 1900, 1890)',
    visualAttributes: [
      'efigie_feminina_de_perfil',
      'barrete_frigio',
      'ramo_de_louro',
      'legenda_republica_dos_estados_unidos_do_brazil',
      'estrela_pentagonal_cintilante',
    ],
    stateMeaningProduced:
      'Operação de purificação simbólica na transição do Império para a República (interpretação minha): a substituição da efígie dinástica de D. Pedro II pela alegoria feminina inspirada na Marianne francesa estabiliza visualmente a nova soberania constitucional de 1891 mediante feminilidade de Estado, operando reconhecimento sem reciprocidade enquanto o texto constitucional mantinha a exclusão política feminina.',
    historicalReceptionBoundary:
      'A ficha documenta o sentido PRODUZIDO pelo dispositivo monetário e postal republicano; a recepção popular cotidiana ou as disputas monarquistas sobre a efígie exigem fontes hemerográficas externas não contidas nos pixels da peça.',
    silenceDeclaration:
      'Silêncio substantivo: ausência de marcadores étnico-raciais afro-indígenas na matriz clássica europeia adotada pela Casa da Moeda no Rio de Janeiro (purificação simbólica embranquecedora).',
    iconoclasticConflictNote:
      'Tensão entre a iconografia positivista da Mulher-Pátria e a tradição francesa revolucionária do barrete frígio.',
    regions: [
      {
        id: 'reg_barrete',
        label: 'Atributo: Barrete Frígio e Coroa de Louros',
        coords: [0.24, 0.14, 0.72, 0.44],
        color: '#146563',
        preIconographic: 'Cobertura cônica macia com ápice curvado para a frente sobre cabeça de perfil à esquerda, circundada por folhagem.',
        iconographicAttribute: 'Barrete frígio (pileus libertatis) combinado a ramo de louro republicano.',
        iconologicalReading:
          'Indício de filiação ao repertório atlântico de personificação feminina da Liberdade e da República, aclimatado pelo regime iconocrático brasileiro de 1889.',
        indiciaryRole: 'Indício morfológico primário (Morelli–Ginzburg) de transição de regime constitucional.',
      },
      {
        id: 'reg_efigie',
        label: 'Efígie: Perfil Clássico e Embodiment de Gênero',
        coords: [0.26, 0.36, 0.68, 0.76],
        color: '#8d550b',
        preIconographic: 'Rosto feminino de traços neoclássicos em perfil estrito voltado para a esquerda, pescoço desnudo e panejamento.',
        iconographicAttribute: 'Alegoria feminina da República (Marianne tropicalizada).',
        iconologicalReading:
          'Despersonalização do soberano masculino em favor de uma feminilidade de Estado abstrata, impassível e desvinculada de cidadania ativa para mulheres reais.',
        indiciaryRole: 'Marcador de purificação simbólica e neutralização corporal.',
      },
      {
        id: 'reg_legenda',
        label: 'Paratexto Epigráfico: Legenda Soberana',
        coords: [0.08, 0.06, 0.92, 0.93],
        color: '#142936',
        preIconographic: 'Inscrição circular em caixa-alta acompanhando a orla dentada do disco metálico.',
        iconographicAttribute: 'Legenda oficial de emissão soberana ("REPUBLICA DOS ESTADOS UNIDOS DO BRAZIL").',
        iconologicalReading:
          'Ancoragem verbal que fixa a leitura estatal da imagem e impede ambiguidade denominativa no comércio jurídico e fiduciário.',
        indiciaryRole: 'Vínculo entre paratexto normativo e figuração visual.',
      },
    ],
  },
  {
    id: 'EXEMPLAR_02',
    itemCode: 'ICON-US-AO440-PARATEXTO',
    title: 'Paratexto Normativo e Selo de Corte em Mandado de Citação Federal (AO 440 / Ponte Metodológica)',
    supportType: 'paratexto_normativo',
    supportLabel: 'Paratexto Normativo / Formulário Judicial Oficial',
    chronologyYear: 1991,
    jurisdiction: 'Estados Unidos (Diálogo Comparativo Common Law)',
    scopeClassification: 'corpus_core',
    provenanceArchive:
      'Administrative Office of the U.S. Courts · Formulário Oficial AO 440 (17 U.S.C. § 105, obra oficial do governo federal dos EUA)',
    rightsStatus: 'Domínio público federal dos EUA (17 U.S.C. § 105; sem anexos privados)',
    visualAttributes: [
      'cabecalho_jurisdicional_impresso',
      'espaco_reservado_selo_oficial_corte',
      'caixa_destinatario_to_defendant',
      'advertencia_deontica_revelia_21_60_dias',
    ],
    stateMeaningProduced:
      'Demonstra como o paratexto normativo estatal organiza visualmente a autoridade jurisdicional antes mesmo do preenchimento individual: a disposição gráfica do cabeçalho, do campo de citação e do espaço do selo oficial produz eficácia simbólica de intimação soberana.',
    historicalReceptionBoundary:
      'O formulário em branco documenta a arquitetura visual da ordem estatal; não prova citação efetiva nem recepção subjetiva por um réu específico.',
    silenceDeclaration:
      'Silêncio de preenchimento (ausência substantiva no template em branco): o campo nominal permanece vazio (`blank_recipient_name`), exigindo abstenção quanto à identidade civil.',
    iconoclasticConflictNote:
      'Caso de fronteira metodológica: ilustra a passagem do protocolo de grounding documental (INE410159) para a análise de paratextos normativos na cultura jurídica.',
    regions: [
      {
        id: 'reg_ao440_header',
        label: 'Cabeçalho de Soberania Jurisdicional',
        coords: [0.10, 0.05, 0.90, 0.16],
        color: '#146563',
        preIconographic: 'Faixa superior centralizada em tipografia serifada negritada com linha pontilhada para distrito judicial.',
        iconographicAttribute: 'Insígnia verbal e espacial da Corte Distrital dos Estados Unidos.',
        iconologicalReading:
          'Inscrição espacial da jurisdição estatal que converte uma folha impressa em instrumento de coerção processual legítima.',
        indiciaryRole: 'Demarcação de autoridade institucional no suporte.',
      },
      {
        id: 'reg_ao440_to',
        label: 'Relação Espacial Campo "To" → Papel Processual',
        coords: [0.08, 0.34, 0.92, 0.45],
        color: '#8d550b',
        preIconographic: 'Rótulo impresso "To: (Defendant\'s name and address)" acima de retângulo em branco.',
        iconographicAttribute: 'Vinculação gráfica entre vocativo de intimação e qualificação processual.',
        iconologicalReading:
          'Evidencia que a posição espacial na grade tipográfica — e não a mera ocorrência lexical de palavras soltas — define o sujeito interpelado pelo direito.',
        indiciaryRole: 'Contraste empírico contra leitura puramente textual sem layout.',
      },
    ],
  },
  {
    id: 'EXEMPLAR_03',
    itemCode: 'ICON-BR-MON-JUSTICA-COMP',
    title: 'Escultura Monumental "A Justiça" e Conflito de Imagens em Arquitetura Forense (Estudo de Limite Epistêmico)',
    supportType: 'monumento',
    supportLabel: 'Monumento / Escultura em Arquitetura Forense',
    chronologyYear: 1961,
    jurisdiction: 'Brasil (Arquitetura Forense e Espaço Cívico)',
    scopeClassification: 'corpus_core',
    provenanceArchive:
      'Referência Metodológica Documentada em legal-grounding/README.md (STF-piloto-visual-001 · Fotografia institucional não redistribuída por restrição de autoria/licença)',
    rightsStatus: 'Imagem não redistribuída no pacote (provenance.json registra autoria fotográfica e licença não esclarecidas)',
    visualAttributes: [
      'figura_feminina_sentada_rigida',
      'venda_frontal_sobre_os_olhos',
      'espada_apoiada_verticalmente_no_colo',
      'ausencia_deliberada_de_balanca',
      'superficie_petrea_monolitica',
    ],
    stateMeaningProduced:
      'Síntese modernista de feminilidade de Estado e soberania jurisdicional (interpretação minha): a supressão da balança ponderadora em favor da retenção exclusiva da venda e da espada desloca a alegoria feminina para a guarda austera da ordem normativa estatal.',
    historicalReceptionBoundary:
      'Quando submetida a episódios de conflito de imagens / iconoclasmo (inscrições ou marcas sobre o suporte pétreo), a inspeção visual descreve exclusivamente a relação espacial objeto–marcas–superfície, sem inferir autoria subjetiva, intenção, dolo, dano permanente ou nexo causal por aparência.',
    silenceDeclaration:
      'Silêncio de coleta/redistribuição: a imagem fotográfica específica de relatório institucional não é redistribuída no repositório em respeito estrito ao rastreamento de direitos.',
    iconoclasticConflictNote:
      'Caso paradigmático para a hipótese de iconocracia/iconoclasmo tropical: o monumento estatal torna-se alvo material de disputa simbólica sobre a legitimidade jurisdicional.',
    regions: [
      {
        id: 'reg_venda_torso',
        label: 'Cabeça Vendada e Geometria Monolítica',
        coords: [0.32, 0.12, 0.68, 0.42],
        color: '#146563',
        preIconographic: 'Bloco escultórico superior com faixa horizontal em relevo cobrindo a região orbital.',
        iconographicAttribute: 'Venda da imparcialidade (Iustitia vendada da tradição moderna).',
        iconologicalReading:
          'Tensão entre imparcialidade formal declarada pelo dispositivo forense e cegueira seletiva perante assimetrias materiais.',
        indiciaryRole: 'Indício de codificação modernista da autoridade judicial.',
      },
      {
        id: 'reg_espada_ausencia_balanca',
        label: 'Espada Central e Ausência Substantiva da Balança',
        coords: [0.35, 0.43, 0.65, 0.86],
        color: '#8d550b',
        preIconographic: 'Eixo vertical rígido entre as mãos pousadas sobre o colo; inexistência de pratos ou fiel de balança.',
        iconographicAttribute: 'Gládio da força coativa (potestas) desacompanhado da libra (prudentia/aequitas).',
        iconologicalReading:
          'Silêncio iconográfico eloquente (paradigma indiciário): a ausência do atributo da ponderação altera o equilíbrio semântico da alegoria feminina.',
        indiciaryRole: 'Recusa/supressão de atributo tradicional documentada no inventário verbal.',
      },
    ],
  },
];

export const COURSE_SCHEDULE_2026_2: CourseScheduleMilestone[] = [
  {
    id: 'M1_OUT_2026',
    date: '08/10/2026 – 13/10/2026',
    phaseLabel: 'Marco 1 · Reunião Inicial, Auditoria Formal e Preflight',
    title: 'Alinhamento de Reconstrução Argumentativa Multimodal e Auditoria dos 10 Esquemas',
    deliverables: [
      'Registro preservado da reunião de 08/10/2026 (leitura textual sem execução de scripts remotos)',
      'Auditoria documental dos 10 esquemas argumentativos, 6 conjuntos de correções, 2 perfis v0.1 e 16 oráculos propostos',
      'Verificador mecânico CASE01 (6 fixtures sintéticos aprovados) e isolamento entre model-input/ e evaluator-only/',
      'Recontagem independente do baseline meteorológico de Guilherme (90 casos, 720 avaliações, 227 correspondências semânticas)',
    ],
    verificationStatus: 'documentado_local',
    epistemicBoundary:
      'Checks de software aprovados (exit 0); piloto jurídico Gemma 4 permanece pausado com 0 execuções candidatas.',
    linkedRepositoryPath: '00-indice/STATUS.md · 03-esquemas/ · 04-experimentos/gemma4-case01/',
  },
  {
    id: 'M2_OUT_NOV_2026',
    date: 'Outubro – Novembro de 2026',
    phaseLabel: 'Marco 2 · Extensão Documental e Protocolo Iconocracia-CV (2026-2)',
    title: 'Casos Processuais AO 399 / 440 / 441 e Especificação do Protocolo Indiciário em iconocracia-cv',
    deliverables: [
      'Pacote legal-grounding com 3 formulários federais (AO 440, AO 441, AO 399), 6 fatos localizados em [0,1] e 12 testes unitários',
      'Modelagem dos esquemas Verbal Classification (#3) e Established Rule (#4) sobre prazos de 21, 60 e 90 dias (FRCP 4, 12 e 14)',
      'Estruturação de docs/projeto-disciplina-visao-computacional-2026-2.md no repositório anavvanzin/iconocracia-cv',
      'Integração com Google Drive para importação de documentos Markdown e imagens de referência sem contaminar INE410159',
    ],
    verificationStatus: 'em_preparacao',
    epistemicBoundary:
      'Referências visuais assistidas exigem dupla revisão humana independente e adjudicação antes de cômputo definitivo.',
    linkedRepositoryPath: 'legal-grounding/ · anavvanzin/iconocracia-cv/docs/projeto-disciplina-visao-computacional-2026-2.md',
  },
  {
    id: 'M3_DEZ_2026',
    date: '02/12/2026',
    phaseLabel: 'Marco 3 · Apresentação Presencial da Disciplina (2026-2)',
    title: 'Apresentação Presencial de Visão Computacional: Evidência Visual, Localização e Limites',
    deliverables: [
      'Apresentação estruturada (Problema / Argumento / Evidências / Lacunas / Próximos passos)',
      'Demonstração comparativa all_inputs vs. without_image e avaliação de localização espacial (IoU ≥ 0,5)',
      'Exposição da fronteira metodológica: paradigma indiciário (Morelli–Ginzburg) vs. inferência automática sobre aparência',
      'Relato transparente de erros de transporte/parse e de abstenções legítimas em campos não preenchidos',
    ],
    verificationStatus: 'em_preparacao',
    epistemicBoundary:
      'Data registrada no histórico da reunião (08/10/2026); requer confirmação final no cronograma oficial da turma 2026-2.',
    linkedRepositoryPath: '07-apresentacoes/BRIEFING.md · anavvanzin/iconocracia-cv',
  },
  {
    id: 'M4_JAN_2027',
    date: '05/01/2027',
    phaseLabel: 'Marco 4 · Entregas Finais da Disciplina (2026-2)',
    title: 'Relatório Final em PDF, Repositório GitHub, Vídeo, Post e Checkpoint / Artefatos Reprodutíveis',
    deliverables: [
      'Relatório técnico-acadêmico em PDF formatado segundo ABNT NBR 6023:2025',
      'Repositório GitHub consolidado com manifestos SHA-256, scripts de verificação e changelog de versões',
      'Vídeo demonstrativo e post de divulgação científica sobre visão computacional aplicada à cultura visual jurídica',
      'Registro de checkpoints/respostas brutas de modelos multimodais (somente após autorização formal e revisão humana do gabarito)',
    ],
    verificationStatus: 'pendente_entrega_final',
    epistemicBoundary:
      'Nenhuma resposta falha deve ser corrigida silenciosamente; versão do modelo, parâmetros e hashes de entrada são obrigatórios.',
    linkedRepositoryPath: 'anavvanzin/iconocracia-cv · anavvanzin/legal-visual-argumentation',
  },
];

export const ABNT_2025_REFERENCES: AbntReferenceItem[] = [
  {
    id: 'AGULHON_1979',
    citationAbnt2025:
      'AGULHON, Maurice. Marianne au combat: l’imagerie et la symbolique républicaines de 1789 à 1880. Paris: Flammarion, 1979. 251 p.',
    methodologicalRole:
      'Análise histórica da personificação feminina da República (Marianne) e de suas mutações entre revolução e estabilização estatal, sem recurso a coeficientes psicométricos.',
  },
  {
    id: 'GINZBURG_1989',
    citationAbnt2025:
      'GINZBURG, Carlo. Mitos, emblemas, sinais: morfologia e história. Tradução de Federico Carotti. São Paulo: Companhia das Letras, 1989. 280 p.',
    methodologicalRole:
      'Fundamentação do paradigma indiciário (Morelli–Ginzburg): o inventário verbal de atributos opera por indícios morfológicos que autorizam atribuição de sentido, não como variável de amostragem probabilística.',
  },
  {
    id: 'HAYAERT_2023',
    citationAbnt2025:
      'HAYAERT, Valérie. Lady Justice: an anatomy of allegory. Edinburgh: Edinburgh University Press, 2023. 312 p. DOI: 10.1515/9781474494137.',
    methodologicalRole:
      'Catalogação histórica e anatômica de alegorias da Justiça (987 ocorrências documentadas com rastreabilidade arquivística, sem cálculo de kappa ou alfa de Krippendorff).',
  },
  {
    id: 'HESPANHA_2012',
    citationAbnt2025:
      'HESPANHA, António Manuel. Cultura jurídica europeia: síntese de um milénio. Coimbra: Almedina, 2012. 588 p.',
    methodologicalRole:
      'Disciplina metodológica contra o anacronismo: reconstruir a lógica interna do dispositivo e da cultura jurídica histórica antes de projetar categorias contemporâneas.',
  },
  {
    id: 'PANOFSKY_2009',
    citationAbnt2025:
      'PANOFSKY, Erwin. Significado nas artes visuais. Tradução de Maria Clara F. Kneese e J. Guinsburg. 3. ed. São Paulo: Perspectiva, 2009. 444 p.',
    methodologicalRole:
      'Distinção operacional entre descrição pré-iconográfica, análise iconográfica e interpretação iconológica.',
  },
  {
    id: 'RESNIK_CURTIS_2011',
    citationAbnt2025:
      'RESNIK, Judith; CURTIS, Dennis. Representing Justice: invention, controversy, and rights in city-states and democratic courtrooms. New Haven: Yale University Press, 2011. 720 p.',
    methodologicalRole:
      'Genealogia comparada da arquitetura forense, da alegoria feminina da Justiça e das tensões entre representação simbólica e exclusão democrática.',
  },
  {
    id: 'SBRICCOLI_2009',
    citationAbnt2025:
      'SBRICCOLI, Mario. Storia del diritto penale e della giustizia: scritti editi e inediti (1972–2007). Milano: Giuffrè, 2009. 2 v.',
    methodologicalRole:
      'Articulação entre iconografia da justiça, história constitucional e dispositivos simbólicos de hegemonia e ordem penal.',
  },
  {
    id: 'WALTON_REED_MACAGNO_2008',
    citationAbnt2025:
      'WALTON, Douglas; REED, Chris; MACAGNO, Fabrizio. Argumentation schemes. Cambridge: Cambridge University Press, 2008. 443 p. DOI: 10.1017/CBO9780511802034.',
    methodologicalRole:
      'Quadro formal dos esquemas argumentativos derrotáveis (Verbal Classification, Established Rule, Witness Testimony) auditados na frente INE410159.',
  },
  {
    id: 'WARNER_1985',
    citationAbnt2025:
      'WARNER, Marina. Monuments and maidens: the allegory of the female form. New York: Atheneum, 1985. 417 p.',
    methodologicalRole:
      'Teorização do paradoxo entre a onipresença de alegorias femininas cívicas e a subordinação jurídica e política das mulheres reais.',
  },
];

export const DEFAULT_PROJETO_DISCIPLINA_MD = `# Projeto da Disciplina de Visão Computacional (2026-2)
Repositório de referência: \`https://github.com/anavvanzin/iconocracia-cv\`
Caminho canônico: \`docs/projeto-disciplina-visao-computacional-2026-2.md\`

## 1. Problema e Fronteira de Escopo
Como articular técnicas de visão computacional (detecção assistida de regiões, localização de atributos em coordenadas normalizadas \`[0,1]\` e reconstrução argumentativa multimodal) ao estudo de dispositivos visuais jurídico-estatais sem incorrer em reducionismo psicométrico, anacronismo ou inferência indevida por aparência?

Este documento estabelece a ponte controlada entre duas frentes que **permanecem metodologicamente separadas**:
- **Frente A (\`INE410159 / legal-visual-argumentation\`)**: Reconstrução de argumentos formais derrotáveis (Walton, Reed & Macagno, 2008) sobre documentos processuais e evidência visual localizada (\`CASE01\` pausado, \`AO 399\`, \`AO 440\`, \`AO 441\` / \`LEGAL01–03\`).
- **Frente B (\`iconocracia-cv / tese Iconocracia\`)**: Catálogo documentado de alegorias femininas na história da cultura jurídica (\`1800–2000\`), operando sob o estatuto do **paradigma indiciário** (\`DEC-2026-07-29-APARATO-MINIMO\`).

## 2. Pipeline Metodológico (\`DEC-2026-07-29-APARATO-MINIMO\`)
\`teoria → critério de inclusão → catálogo documentado → leitura densa de casos exemplares → montagem → análise\`

1. **Critério de Inclusão e Exclusão Auditável**:
   - **Corpus Core (\`1800–2000\`)**: Moedas, selos, brasões, monumentos, arquitetura forense e paratextos normativos estatais.
   - **Comparador / Apêndice**: Material anterior a 1800, posterior a 2000 ou em suportes não estatais. Exige justificativa explícita e **não entra nas contagens do corpus core**.
2. **Estatuto de Paradigma Indiciário (Morelli–Ginzburg)**:
   - O inventário verbal de atributos (balança, espada, venda, barrete frígio, fasces, vestimenta clássica, marcas de iconoclasmo) reúne indícios que autorizam atribuição de sentido histórico-jurídico.
   - **Vedação de Aparato Psicométrico como Prova**: Não se empregam kappa de Cohen, alfa de Krippendorff/Cronbach, teste-reteste nem clusterização fatorial para "provar" regimes iconocráticos. Em consonância com Hayaert (2023), Agulhon (1979), Warner (1985), Sbriccoli (2009) e Resnik & Curtis (2011), métricas de concordância ou IoU de modelos servem apenas como **diagnóstico interno do instrumento computacional**.
3. **Sentido Produzido vs. Sentido Recebido**:
   - A análise reivindica o **sentido produzido pelo dispositivo estatal** (*feminilidade de Estado*, *reconhecimento sem reciprocidade*, *purificação simbólica*). A recepção pelo espectador histórico exige fonte empírica autônoma.

## 3. Protocolo de Visão Computacional e Detecção Assistida
- **Entrada Neutra vs. Metadados do Avaliador**: O modelo multimodal recebe exclusivamente os bytes da imagem e o contrato de vocabulário/abstenção; proveniência de acervo, gabarito de caixas \`[x1, y1, x2, y2]\` e leitura iconológica permanecem isolados em \`evaluator-only\`.
- **Verificação de Localização Espacial**: Exige interseção sobre união (\`IoU ≥ 0,5\`) com a região revisada por humano; caixas de página inteira (\`[0, 0, 1, 1]\`) são rejeitadas como evidência localizada.
- **Política de Abstenção e Silêncios**: Ausência de atributo visual (ex.: Justiça sem balança ou campo processual em branco) deve gerar registro explícito de ausência/abstenção, distinguindo *ausência substantiva na fonte* de *ausência de coleta*.

## 4. Cronograma Consolidado (2026-2)
- **02 de dezembro de 2026**: Apresentação presencial da disciplina de Visão Computacional.
- **05 de janeiro de 2027**: Entrega final (relatório em PDF, repositório GitHub versionado com hashes SHA-256, vídeo, post e artefatos de avaliação).
`;
