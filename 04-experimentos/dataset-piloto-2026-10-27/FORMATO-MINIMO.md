# Formato mínimo do aditivo

Este pacote é adicional. Nenhum notebook, caso, referência ou runner anterior é alterado. Os exemplos são propostas de pesquisa; referências assistidas não são adjudicação humana nem resultados de modelos.

## Entrada permitida ao candidato

Um JSON em `model-input/` por tarefa:

- `case_id`: identificador único neste aditivo.
- `asset_id`: identificador neutro do estímulo.
- `image`: caminho relativo a `model-input/`, com nome neutro.
- `image_sha256`: hash dos bytes efetivamente destinados ao candidato.
- `context`: contexto neutro que não entrega o fato visual alvo.
- `enthymeme`: pergunta/argumento incompleto, sem a resposta esperada.
- `provided_rule`: regra operacional ou hipotética explicitamente fornecida, separada dos fatos a observar.
- `output_contract`: formato, vocabulário autorizado e abstenção sem imagem.

A imagem, o contrato e esses textos podem compor o estímulo. URL descritiva, nome original da fonte, transcrições de referência, caixas e respostas esperadas não entram no candidato.

## Referência exclusiva de avaliação

Um JSON separado em `evaluator-only/`:

- `case_id`, `reference_status`, revisão humana pendente.
- Proveniência: URL oficial, arquivo original, hash, página, data de obtenção, direitos e transformação/renderização.
- `facts`: alvos factuais propostos, com átomo, caixa XYXY normalizada, página e transcrição curta quando pertinente.
- `derived`, `expected_output`, `without_image_expected`.
- `limits`: conclusões que o estímulo não permite e limites da edição documental.

Caixas são propostas após inspeção dos pixels; não provam automaticamente relação semântica. Sem fonte/imagem disponível, a tarefa permanece apenas na fila de avaliação, sem entrada pronta para o candidato.

## Condições deste aditivo

O lote inicial prepara `with_image` e `without_image`, mantendo os textos iguais e retirando apenas os bytes da imagem no segundo controle. Sem imagem: `[],undetermined(visual_facts,doc1)`. Isso não significa que o fato é falso.

Contexto e entimema são campos separados para futura análise. Não se afirma que este lote já executa as quatro ablações do pipeline anterior. As tarefas de uma família compartilham fonte/estrutura e não são observações independentes.

Na continuação, os seis casos estão materializados e as duas condições usam prompts byte a byte idênticos. A presença de imagem muda somente nos campos de anexo. Cada futura chamada deve ter contexto independente, sem memória de uma condição anterior. Todos os caminhos `source_file` e `model_image` nas referências ativas são relativos à raiz do pacote. `facts.page` identifica a página da fonte; as caixas normalizadas referem-se sempre ao PNG candidato, inclusive quando ele é um recorte.

## Compatibilidade comprovada por leitura

`legal-grounding/adapter.py:23–38` lê seu próprio `cases.json` e fixa os predicados de destinatário de formulário. Não aceita estes exemplos arbitrários como substituição direta. `legal-grounding/grounding.py:83` aceita arquivo de casos alternativo, mas fixa página 1 e aspectos do contrato. O notebook adicional apenas carrega/confere dados offline; não chama esses runners ou modelos.

Os registros de execução futura precisam preservar identificador/versão efetiva do modelo, configuração, prompt completo, imagem/hash, condição efetiva, resposta bruta e erro original. Nenhuma execução é autorizada por este pacote.
