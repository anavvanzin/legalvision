# Núcleo portável e diferenças de plataforma

O pacote contém TXT, JPEG, JSON Schema, JSON, CSV/JSONL e Python da biblioteca padrão. Não é export/import de workflow de uma plataforma.

## Mapeamento manual

| Papel | Arquivo | Onde usar |
| --- | --- | --- |
| Instrução estável | `model-input/system.txt` | Campo system; ou prefixo textual registrado quando indisponível |
| Mensagem da condição | `model-input/conditions/01_with_image.txt` ou `02_without_image.txt` | Mensagem user, uma conversa independente por condição |
| Pixels | `model-input/images/case01.jpg` | Parte de imagem somente em with_image |
| Contrato de saída | `model-input/output.schema.json` | Validação externa; recurso nativo somente quando suportado |
| Referência/análise | `evaluator-only/` | Ambiente do avaliador; nunca contexto, tools, RAG ou anexos do candidato |

## Caminhos Google, sem executar nesta entrega

**AI Studio / Developer API:** Gemma 4 hospedado via IDs `gemma-4-31b-it` e `gemma-4-26b-a4b-it` documentados. A documentação mostra imagens e system instructions. A API Gemma descreve Thinking como opção high/minimal; registre o estado que efetivamente houver no cliente. Não inferir disponibilidade de schema rígido para Gemma só porque exemplos de Gemini o mostram.

**Gemini Enterprise Agent Platform:** o cartão do modelo documenta `gemma-4-26b-a4b-it-maas`, experimental, entrada de imagem, saída de texto e saída estruturada; Thinking não é suportado nesse endpoint. O guia de structured output exige API, sem configurar response schema pelo console. No caminho manual, solicite JSON pelo prompt e valide externamente. A disponibilidade/ativação/custo na conta da usuária não foi testada.

**Caminho opcional por API, somente para futura decisão:** mapeie system → system instruction; user → texto de uma única condição; imagem → input de imagem de IMG01 apenas em with_image; registre ID, configuração e resposta integral. Consulte os exemplos oficiais do endpoint escolhido. Este pacote não contém cliente autenticado, deploy, upload automático ou chave. Não é necessário usar API para a execução manual.

Mantenha modelo, versão e configurações iguais nas duas condições. Se mudar produto, endpoint, modelo, system-mode, Thinking ou native-schema-mode, registre como outra execução, sem juntar os resultados como se a condição fosse a mesma. Registre controles ausentes como `not_exposed` ou `not_supported`, sem inventar valores.

## Limites de uso

Uma fotografia pública e regra hipotética dispensam documentos privados de processos. A tabela oficial de preços consultada lista Gemma 4 na Developer API em modalidade gratuita; isso não demonstra que o endpoint Cloud seja gratuito nem que a conta de Ana tenha toda funcionalidade. O uso de dados no free tier depende dos termos do serviço. Não carregue dados sensíveis neste piloto.

Fontes: [Gemma na Developer API](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api), [cartão Cloud Gemma 4](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it), [schema por API](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/control-generated-output), [preços](https://ai.google.dev/gemini-api/docs/pricing#gemma-4). Consulta em 13/10/2026; sem uso autenticado da conta.
