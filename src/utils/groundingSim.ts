export interface GroundingFinding {
  id: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  kind: 'bug_comprovado' | 'risco_metodologico' | 'hipotese';
  location: string;
  title: string;
  evidence: string;
  failureScenario: string;
  impact: string;
  minimalFix: string;
}

export const GROUNDING_REVIEW_FINDINGS: GroundingFinding[] = [
  {
    id: 'F1',
    priority: 'P1',
    kind: 'bug_comprovado',
    location: 'grounding_validation.py :: parse_premises() (linhas 163–204)',
    title: 'Aceitação silenciosa de cauda arbitrária ou truncada após o primeiro "]" de nível zero',
    evidence:
      'Em parse_premises(), assim que encontra char == "]" com stack vazia (linha 188), a função retorna parts imediatamente sem inspecionar o restante da string (text[pos+1:]).',
    failureScenario:
      'Uma resposta malformada como "[p(a), q(b)] LIXO_SEM_VIRGULA" ou "[p(a)], [segunda_lista_ignorada], concl(a)" ou mesmo sem conclusão após "]," é aceita por parse_premises() sem levantar ValueError.',
    impact:
      'Viola a gramática declarada ("[premissas], conclusão") e permite que respostas sintaticamente corrompidas após "]" passem como supported se as premissas iniciais forem mapeadas.',
    minimalFix:
      'Exigir após o "]" de fechamento que o sufixo text[pos+1:].strip() comece com "," seguido de conclusão não vazia e sem colchetes desbalanceados.',
  },
  {
    id: 'F2',
    priority: 'P1',
    kind: 'bug_comprovado',
    location: 'grounding_validation.py :: index_mappings() & evaluate_content() (linhas 149–153, 248–258)',
    title: 'Duplicação de alegações visuais idênticas na mesma premissa e ausência de verificação de cobertura intra-premissa',
    evidence:
      'index_mappings() verifica unicidade de premise["index"], mas não impede visual_claims duplicadas (mesmo par evidence_id + atom) nem exige que premissas compostas (ex.: "forecast(edinburgh..., belfast..., cardiff..., london...)" em class3:9) mapeiem todas as sub-alegações.',
    failureScenario:
      'Na amostra real claude-sonnet class3:9 without_context, asserts(...) contém 16 pares cidade×dia×temperatura. Se o mapeamento incluir apenas 1 visual_claim (ex.: london_sunday_temperature) e omitir as outras 15 alegações visuais da mesma premissa (inclusive uma incorreta), evaluate_content() retorna status="supported".',
    impact:
      'Brecha crítica de falso positivo ("cherry-picking intra-premissa"): uma premissa com 15 fatos alucinados e 1 fato verdadeiro anotado recebe supported se o anotador mapear apenas o fato verdadeiro.',
    minimalFix:
      '1) Rejeitar visual_claims duplicados em index_mappings(); 2) Adicionar campo booleano obrigatório atomic_decomposition_complete (ou exhaustive_claims: true) por premissa visual, bloqueando supported quando houver alegações visuais parciais não cobertas.',
  },
  {
    id: 'F3',
    priority: 'P1',
    kind: 'bug_comprovado',
    location: 'grounding_validation.py :: index_manifest(), index_annotations(), index_mappings() (linhas 86–156)',
    title: 'TypeError não tratado quando elementos de listas JSON são null/primitivos ou quando campos booleanos passam como int',
    evidence:
      'Em Python, isinstance(True, int) é True, embora o código use type(number) is int em alguns pontos e type(v) in (int, float) em index_annotations (o que evita bool ali). Porém, em load_json(), se data.get(collection) contiver elementos que não são dict ou se image.get("review") for None, review_state() lança ValueError, mas em approved(review, allow_synthetic) review["status"] assume que review já foi validado; mais grave: se root / "results" não existir em audit(), (root / "results").iterdir() lança FileNotFoundError (capturado como OSError no main, mas sem mensagem contextual clara). Além disso, em index_mappings(), key = tuple(mapping.get(name)...) usa all(nonempty(part) for part in key), mas não valida se case_id existe no manifesto antes do final de audit().',
    failureScenario:
      'Em evaluate_content() chamado diretamente (como na suíte de testes ou uso modular) com um dicionário mapping sem passar previamente por index_mappings(), a ausência de chaves como "premises" ou "coverage" levanta KeyError em vez de ValueError documentado.',
    impact:
      'Quebra de contrato de exceção em chamadas diretas a evaluate_content() e diagnóstico opaco quando arquivos/pastas de resultados não estão presentes.',
    minimalFix:
      'Validar o objeto mapping e annotation defensivamente ou garantir invariantes na entrada de evaluate_content(), e verificar existência de root / "results" com require().',
  },
  {
    id: 'F4',
    priority: 'P1',
    kind: 'bug_comprovado',
    location: 'grounding_validation.py :: evaluate_content() (linhas 237–250)',
    title: 'Ordem de precedência mascara premise_text_or_index_mismatch quando coexiste com mismatch em outra premissa',
    evidence:
      'Quando item["index"] >= len(premises) ou item["text"] != premises[number], o código adiciona "premise_text_or_index_mismatch" em result["reasons"] e faz continue (sem marcar mismatch=True). Se outra premissa tiver mismatch, o status final vira "mismatch" (julgamento substantivo e contabilizado em decisive_records!), apesar de o mapeamento estar corrompido/dessincronizado com as premissas da resposta.',
    failureScenario:
      'Um mapeamento cujo texto de premissa não bate com a resposta parseada ("premise_text_or_index_mismatch") ou com "incomplete_premise_coverage" ainda entra no denominador de decisive_records se outra premissa tiver source_unavailable ou atom mismatch.',
    impact:
      'Contamina o denominador decisive_records e supported_rate_among_assessed com mapeamentos estruturalmente inválidos (que deveriam ser unverified, nunca decisive).',
    minimalFix:
      'Tratar "incomplete_premise_coverage" e "premise_text_or_index_mismatch" como erros estruturais de mapeamento que forçam status="unverified" antes de computar mismatch substantivo.',
  },
  {
    id: 'F5',
    priority: 'P2',
    kind: 'bug_comprovado',
    location: 'grounding_validation.py :: evaluate_content() (linhas 239–245) & without_enthymeme / without_context',
    title: 'Inconsistência entre source="scheme" e source="enthymeme" na premissa de autoridade (position_to_know)',
    evidence:
      'Em unit_tests/test_grounding_validation.py (linha 37) e mapping.example.draft.json (linha 21), a premissa 0 position_to_know(weatherman, meteorology) é anotada com sources: ["enthymeme", "scheme"]. Na configuração without_enthymeme (col1), o modelo recebe apenas Imagem + Contexto e os exemplos de esquemas (all_examples.txt), e ainda assim instancia position_to_know(...) a partir do template do esquema e da imagem de TV.',
    failureScenario:
      'Se o anotador seguir o padrão do exemplo e rotular position_to_know com ["enthymeme", "scheme"] nas respostas de without_enthymeme, evaluate_content() marcará todas como mismatch ("source_unavailable_in_configuration"). Se rotular apenas como ["scheme"] ou ["image", "scheme"], a regra fica dependente de convenção subjetiva do anotador.',
    impact:
      'Ambiguidade metodológica na atribuição de fonte entre entimema omitido e template do esquema fornecido no prompt de todas as configurações.',
    minimalFix:
      'Documentar regra objetiva: em without_enthymeme, elementos estruturais vindos de all_examples.txt têm fonte "scheme" (e "image" se o agente for identificado visualmente), reservando "enthymeme" apenas para termos exclusivos da frase omitida.',
  },
  {
    id: 'F6',
    priority: 'P2',
    kind: 'risco_metodologico',
    location: 'grounding/evidence.draft.json & grounding/mapping.example.draft.json',
    title: 'Risco de circularidade (anchoring) entre mapeamento da resposta e átomo do gabarito visual',
    evidence:
      'O validador compara literal(claim["atom"]) == literal(fact["atom"]). Como ambos os átomos são escritos manualmente em JSON, um revisor que consulte evidence.draft.json enquanto traduz "sunny_27_degrees" para átomos pode inconscientemente copiar a quádrupla exata do gabarito (incluindo modality="forecast" e unit="unspecified").',
    failureScenario:
      'Em class3:5 (all_inputs), o modelo escreve will_rain_in_london_on_friday(23°C) com unidade explícita "°C", enquanto em class1/test15.png a unidade não está impressa ("unspecified"). Se o revisor normalizar "23°C" para unit="unspecified" para casar com o fato anotado, aprovará uma extrapolação de unidade.',
    impact:
      'Inflação artificial de supported por normalização caridosa durante o mapeamento.',
    minimalFix:
      'Protocolo duplo-cego de normalização: Etapa 1 anota a imagem (fatos visuais); Etapa 2 (independente, sem ver os átomos da Etapa 1, apenas o vocabulário canônico de predicados) traduz o literal textual da premissa do modelo em átomo; se o modelo escreveu "23°C" ou "25_celsius", o átomo da premissa DEVE registrar unit="celsius", gerando mismatch legítimo contra unit="unspecified".',
  },
  {
    id: 'F7',
    priority: 'P2',
    kind: 'risco_metodologico',
    location: 'grounding/evidence.draft.json (linhas 16–95) — inspeção sem acesso aos PNGs',
    title: 'Anotações em rascunho contêm regiões idênticas para células distintas e modalidades que exigem confirmação nos pixels',
    evidence:
      'Em evidence.draft.json para images/class1/test15.png: london_sunday_temperature, london_sunday_sun e london_friday_temperature possuem exatamente a mesma bounding box [0.5, 0.69, 0.2, 0.2]. Além disso, os 4 fatos de test15.png usam modality="forecast", enquanto test1.png (class2) usa modality="displayed" para números sob o título "7 DAY FORECAST".',
    failureScenario:
      'Colunas diferentes (Sunday vs Friday na linha de London) não podem ocupar exatamente o mesmo retângulo [0.5, 0.69, 0.2, 0.2] se a caixa for por célula; e a escolha entre modality="displayed" vs "forecast" entre test15.png e class2/test1.png cria divergência de critério entre imagens.',
    impact:
      'Inconsistência de vocabulário (displayed vs forecast) e imprecisão espacial nas regiões propostas.',
    minimalFix:
      'Ao abrir os PNGs originais na revisão humana: 1) delimitar a bounding box específica da célula (linha × coluna) ou declarar explicitamente que a região cobre toda a linha de London; 2) padronizar se tabelas de previsão usam modality="forecast" apenas quando houver cabeçalho de previsão explícito na imagem.',
  },
];
