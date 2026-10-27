# Avaliação futura - não fornecer ao candidato

**Estado atual: zero respostas de modelo.** A fotografia foi inspecionada e pré-anotada; nenhum ensaio de condições foi executado. Tests locais usam fixtures sintéticos de software, não saídas de Gemma.

## Antes de executar

- Ana revisa `reference/gold.json`, inclusive regiões aproximadas, e registra seu parecer em `results/human-review.template.json` copiado para novo arquivo.
- Preservar a versão assistida congelada e qualquer divergência da revisão humana em adendo, sem reescrever o gabarito depois de ver respostas.
- Confirmar dois chats novos, mesmo modelo/versão/configuração; a condição sem imagem não recebe pixels, fonte, legenda, histórico, anexos, RAG ou ferramentas de busca.
- Q3, cor predominante do quadro, não é respondida pelo texto. A definição de bicicleta_visual fornece critérios de categoria, não observações de A.
- Arquivos permitidos ficam em model-input. Só a fotografia neutra e o prompt da condição vão ao candidato. Não enviar o ZIP, esta pasta ou background.

## Critérios separados, sem nota agregada

| Eixo | Conferência | Limite |
| --- | --- | --- |
| Formato/vinculação | JSON, predicados/aridade, A/C/F, fonte R1 e conclusão derivada | Script local não interpreta pixels |
| Semântica factual | Q1 contagem, Q2 visibilidade, Q3 cor e classificação contra referência revisada | Registro assistido não é gold humano |
| Evidência visual | Razões e regiões realmente mostram o fato; tolerar regiões aproximadas | ID/coordenada válida não prova suporte |
| Questões críticas | Revisar as justificativas CQ1/CQ2 e o que ficou desconhecido | Estados do candidato são autoavaliação |
| Abstenção | Sem pixels: respostas/classificação insufficient e conclusão null | Warrant R1 pode ser transcrito do texto |
| Regra normativa | Regra hipotética fornecida; não inventar lei, culpa ou propriedade | Resultado só no cenário fictício |

Registrar correspondência por pergunta/caso, sobreafirmação, regras adicionadas sem suporte, falhas de JSON, mudanças de entidade e divergências. Não apresentar N=1 como acurácia generalizável ou evidência de validade jurídica. A presença de predicados é separada da semântica e do suporte.

## Preservação da saída

Salve primeira resposta integral, erros e bloqueios. Não repetir até acertar sem registrar novas tentativas. Uma resposta malformada é um resultado observável. Se extrair JSON de markdown, guarde original e derivado com hash e descrição. Parsing não pode corrigir fatos ou termos silenciosamente.

Use `tools/validate_candidate.py` para a conferência mecânica. `binding_status=incomplete` é compatível com abstenção na condição sem imagem; não significa argumento derrotado. CQs continuam self_reported. Para validação integral de JSON Schema, um validador Draft 2020-12 externo pode ser usado depois, mas não é instalado ou exigido por estes checks stdlib.

## Relação com o projeto

O perfil verbal_classification 0.1 vem da auditoria dos dez esquemas no commit jurídico `16919e55dd570387f67f83227a2d5cbf3639f8b8`. `background/legal-package` contém documentos, dois perfis propostos e 16 oráculos ainda não executados. O checker deste pacote é uma adaptação mínima para CASE01; não implementa o motor jurídico completo. `background/formal-review.md` registra pendências, incluindo WT07 do perfil testemunho, que não é usado neste piloto.
