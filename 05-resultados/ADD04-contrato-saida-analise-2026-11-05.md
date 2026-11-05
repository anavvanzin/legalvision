# ADD04 — contrato de saída e extração controlada

Registro da análise: 5 de novembro de 2026, horário de Florianópolis.
Status: recomendação metodológica; extrator e regressões propostos, não implementados.
Escopo: análise documental e leitura de código, sem novas inferências, adjudicação ou cálculo de acurácia.

## Recomendação

Reforçar o contrato para futuras execuções e manter a validação estrita da resposta original como resultado principal. A extração controlada pode complementar a análise como registro derivado separado; nunca deve converter retroativamente uma falha de formato em sucesso do modelo.

O resultado histórico permanece: duas respostas recebidas, duas falhas de contrato e nenhum resultado semântico adjudicado. A avaliação do modelo e a avaliação do sistema modelo–processador são objetos distintos.

## Fontes e alcance da verificação

- [Relatório experimental](https://drive.google.com/file/d/1KAaYMcw3bxNbcYnpYDHhQru3rvlOleTh/view).
- [Registro de continuidade](https://drive.google.com/file/d/1SpFdn5Kj7tpxSNpQuRp8Uh07aPZEndR7/view).
- [PR #1](https://github.com/anavvanzin/legalvision/pull/1), aberta no momento da consulta; código examinado no commit `d867d9e3459bd79b8fc430ca9517e2e855df1631`.
- Commit local informado para o experimento: `3f01dc7d1cbed59e26b5494772368200eea884c1`. Não recuperável pelo GitHub durante a análise. A implementação adicional em `evidence-audit/` não foi conferida diretamente; informações sobre ela são atribuídas ao registro de continuidade.

A PR documentava a preparação anterior. Este documento acrescenta uma análise posterior, sem reescrever o estado histórico do pacote preparado ou incorporar o arquivo integral da execução. As transcrições abaixo provêm do relatório: não substituem os corpos HTTP e demais evidências originais.

## Experimento documentado

Em 3 de novembro de 2026, às 23h03min09s -03, um par ADD04 foi concluído em `vanzin`, com Gemma 4 E4B GGUF Q4_K_M. As duas requisições retornaram HTTP 200. Ordem fixa: sem imagem, depois com imagem; uma repetição. O relatório registra texto e configurações idênticos, diferindo apenas pelo PNG anexado.

Temperatura 0, top_p 1, máximo de 256 tokens de saída, reasoning desativado, contexto 4096 e um slot de predição. Nenhuma seed foi especificada. Hashes dos pesos remotos e da versão do backend permanecem não verificados. Transporte multimodal funcional não comprova grounding, validade semântica ou benefício geral da imagem.

## Respostas reais

Sem imagem, conforme transcrição do relatório:

```text
{"format": "[premises],conclusion; all formal atoms use lowercase ascii", "with_image": "[],undetermined(visual_facts,doc1)"}
```

Com imagem:

```text
{"format": "[printed_letter(doc1,letter_e), red_diagonal_pattern(doc1,single_diagonal)],operational_category(doc1,parking_prohibited)"}
```

| Camada | without_image | with_image |
| --- | --- | --- |
| Transporte | HTTP 200 | HTTP 200 |
| Contrato original | Falha: objeto JSON e chave inadequada | Falha: expressão encapsulada em JSON |
| Expressão recuperável | `[],undetermined(visual_facts,doc1)` | Duas premissas e conclusão operacional |
| Interpretação possível | Abstenção instruída, recuperada de campo inadequado | Encadeamento compatível com a regra fornecida se as premissas visuais forem verdadeiras |
| Validação independente | A abstenção não demonstra necessidade causal dos pixels | Validade visual pendente; sem evidência espacial ou adjudicação |

A chave `with_image` da primeira resposta não redefine a condição: a condição vem da requisição preservada. Extrair a afirmação visual da segunda resposta não verifica essa afirmação.

## Alternativa A — reforçar o contrato

O compositor atual usa `json.dumps(case["output_contract"])`. A reprodução de chaves pelo modelo é compatível com confusão entre descrição do formato e formato da resposta, mas isso é uma hipótese, não uma causa demonstrada pelo par.

Proposta de instrução:

> Responda exclusivamente com uma expressão `[premises],conclusion`. Não reproduza o objeto que descreve o contrato. Não use JSON, aspas externas, Markdown ou explicações. Sem imagem, responda exatamente `[],undetermined(visual_facts,doc1)`.

Aplicar a mesma revisão às duas condições, sem acrescentar resposta visual esperada ou conteúdo de evaluator-only. A única diferença de entrada entre condições deve continuar sendo o anexo.

Efeitos:
- Não modifica a classificação das respostas já recebidas.
- Permite medir adesão direta ao contrato em novas execuções.
- Exige versão e hash novos do prompt, compositor e entradas preparadas.
- Não garante melhoria: o efeito só poderá ser medido futuramente.
- Ajustes motivados por ADD04 devem ser declarados; o caso passa a informar o desenvolvimento do protocolo, não uma confirmação independente da melhoria.

## Alternativa B — extração controlada

Política proposta, determinística e conservadora:

1. Preservar e validar primeiro a resposta textual original.
2. Ler JSON estrito, rejeitando chaves duplicadas.
3. Examinar somente valores textuais de primeiro nível.
4. Exigir que o valor inteiro seja uma expressão formal; não procurar fragmentos em prosa.
5. Extrair apenas quando houver um único candidato. Zero ou múltiplos candidatos resultam em rejeição.
6. Registrar campo de origem, versão do extrator, hashes e conflitos de rótulo.
7. Não completar premissas, corrigir termos, trocar categorias ou escolher pelo gabarito.

Aplicação conceitual às respostas:
- Sem imagem: candidato em `$.with_image`, com conflito de rótulo registrado. O texto descritivo em `$.format` não é expressão formal.
- Com imagem: candidato em `$.format`; as premissas e a conclusão são preservadas, sem acrescentar regiões ou fontes.
- Em ambas: `raw_contract_valid=false` permanece invariável. Um derivado pode passar na sintaxe sem que a resposta original passe no contrato ou que o conteúdo seja verdadeiro.

São efeitos previstos, não resultados de um extrator implementado. Como a política foi formulada após observar as respostas, sua aplicação a este par é exploratória. Fixar a política antes de novas execuções permite uma análise secundária prospectiva.

## Comparação

| Critério | Instruções reforçadas | Extração controlada |
| --- | --- | --- |
| Intervenção | Altera estímulo futuro | Altera processamento posterior |
| Resultado principal | Adesão direta da resposta | Deve continuar sendo adesão original |
| Reprodutibilidade | Preservação de prompt, modelo e ambiente; melhoria ainda desconhecida | Reprocessamento determinístico de bytes com extrator fixado |
| Integridade | Preserva a falha histórica | Exige registro separado e rastreável |
| Risco | Sobreajuste ao ADD04 | Seleção favorável e ocultação de falhas |
| Papel recomendado | Protocolo principal | Análise secundária |

## Validadores e testes examinados

Os caminhos abaixo referem-se ao commit GitHub examinado.

| Componente | Cobertura e limite |
| --- | --- |
| `04-experimentos/dataset-piloto-2026-10-27/validar_entradas.py` | Inventário neutro, hashes, campos permitidos, composição canônica, pares e ausência de anexo no controle. Não valida respostas. |
| `tests/test_dataset_integration.py` | Rejeita vazamentos, alterações de imagens, registros duplicados e inconsistências de preparação; verifica distribuição pública neutra. |
| `tests/test_pilot_notebooks.py` | Seleção de estímulo, inventário incompleto, campos de referência, prompts divergentes e imagem no controle. Não testa saída ADD04. |
| `legal-grounding/grounding.py` | `parse_output` analisa a expressão inteira, sem raspar predicados de comentários. Pela leitura do código, rejeitaria os dois JSONs e aceitaria sintaticamente os valores extraídos. |
| `legal-grounding/tests/test_grounding.py` | Distingue correspondência de conclusão, suporte de premissas, hash e localização; testa texto adicional inválido e ausência de evidência. |
| `src/utils/validators.ts` | Validador JSON do CASE01, com campos e predicados próprios; não aplicável diretamente ao contrato ADD04. |
| `04-experimentos/gemma4-case01/evaluator-only/tools/test_validate_candidate.py` | Fixtures sintéticas para vinculação, fonte da regra, abstenção, inspeção declarada e JSON inválido. Não são resultados de modelos ADD04. |

O parser formal ignora espaços e remove pontos finais com `rstrip('.')`. Aceita termos genéricos sem impor sozinho vocabulário, aridade e papéis específicos do ADD04. Aceitação sintática não equivale a adesão exata ao contrato.

O avaliador associado usa `all_inputs`, não `with_image`; eventual adaptação deve ser explícita e testada, sem renomear silenciosamente os registros.

O registro de continuidade relata 59 checks anteriores aprovados e testes adversariais nos quais proposta e referência concordam sobre região irrelevante. Esses resultados são documentais, não testes reexecutados nesta análise. Concordância de anotações não certifica significado visual.

## Regressões propostas

| Caso | Resultado obrigatório |
| --- | --- |
| Duas respostas reais integrais | `raw_contract_valid=false` em ambas, mesmo após extração |
| Resposta real sem imagem | Derivado de `$.with_image`; conflito registrado; condição preservada |
| Resposta real com imagem | Derivado de `$.format`; nenhuma região ou observação humana inventada |
| Expressão diretamente no topo | Validade formal própria, distinta de recuperação de JSON |
| Duas expressões, mesmo idênticas | Rejeição por ambiguidade |
| JSON duplicado, truncado ou valor não textual | Rejeição sem reparo |
| Expressão em prosa, Markdown ou objeto aninhado | Não extrair por busca oportunista |
| Espaços, newline e pontos finais | Política lexical versionada, incluindo múltiplos pontos |
| Átomo desconhecido, doc2, duplicata ou papéis trocados | Falha do contrato específico, mesmo se a sintaxe passar |
| Diagonal única com categoria de diagonais cruzadas | Sintaxe separada de inconsistência da regra |
| Premissas visuais sem imagem | Falha da política de evidência, mesmo com coincidência com referência |
| Derivado válido sem adjudicação | Validade semântica e métricas humanas pendentes |
| Reprocessamento | Mesmo derivado para mesmos bytes e versão; original intacto |
| Alteração de bytes | Detectada por hash; não sobrescrever o original |
| Isolamento do extrator | Não consulta referências esperadas nem chama modelo/rede para reparar |
| Agregação | Falhas originais permanecem no denominador; taxa de recuperação separada |

Para fixtures probatórias, copiar os bytes dos artefatos originais e verificar seus hashes. As transcrições deste documento são documentação e não substituem essa etapa.

## Decisões a versionar antes de novas execuções

1. **Contrato e gramática:** tolerâncias lexicais, vocabulário, aridade, papéis, duplicatas e abstenção.
2. **Prompt e compositor:** texto completo, versão e hash; sincronizar verificações canônicas e notebooks.
3. **Extrator:** campos elegíveis, profundidade, ambiguidade, conflitos e proibição de reparos.
4. **Proveniência:** corpo HTTP, texto produzido pelo modelo e derivado em registros separados, com hashes e vínculo à requisição. Desempacotar a API é diferente de desembrulhar JSON produzido pelo modelo.
5. **Avaliação:** adesão original principal, recuperação secundária, denominadores explícitos e métricas semânticas bloqueadas até referência adjudicada.
6. **Execução:** modelo, quantização, configurações, ordem, repetições e retries; preservar limitações sobre seed, pesos e backend.
7. **Revisão humana:** duas observações independentes, preferencialmente sem respostas candidatas ou referências assistidas previamente expostas; preservar anotações e registrar adjudicação posterior de divergências.

Nenhum agente deve preencher os pacotes e chamar isso de revisão humana. Referências permanecem `assistant_proposed_pending_human_review`. A categoria é operacional, derivada de regra hipotética; não é determinação de direito vigente.

## Estado desta entrega

Documento de análise salvo a pedido de Ana. Não implementa o extrator, não muda o contrato vigente, não modifica respostas brutas ou referências e não autoriza nova execução. A preparação histórica e o smoke test posterior devem permanecer distinguíveis.
