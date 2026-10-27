# Executar o pacote com Gemma 4

O pacote está preparado; **nenhum experimento de Gemma foi executado**.

1. Extraia `PACOTE-GOOGLE-GEMMA4-INE410159-2026-10-13.zip`. Não envie o ZIP inteiro ao modelo.
2. Abra Google AI Studio, crie um chat novo e escolha Gemma 4 disponível em sua conta. Registre o modelo/versão e configurações.
3. Cole `model-input/system.txt` em System Instructions, se disponível. Cole `model-input/conditions/01_with_image.txt` e anexe apenas `model-input/images/case01.jpg`.
4. Preserve a primeira resposta integral. Faça a condição `02_without_image.txt` em outro chat novo, com o mesmo system/modelo/configuração, sem imagem ou histórico anterior.
5. Registre as saídas em `evaluator-only/results`. Use o checker local indicado em `COMECE-AQUI.md`; revise a referência assistida antes de avaliar.

**Nunca carregue `evaluator-only` no candidato:** contém fonte, licença, referência provisória e testes. A imagem tem nome neutro e Exif descritivo removido. A regra é hipotética, sem alegação de direito vigente.

Solicitar JSON no prompt é o caminho manual. O schema padrão não é workflow nem importação universal pela interface. A documentação Cloud exige API para response schemas. A portabilidade entre AI Studio e Gemini Enterprise Agent Platform está explicada no ZIP, com IDs e capacidades distintos.

Documentação: [AI Studio](https://ai.google.dev/gemini-api/docs/ai-studio-quickstart?hl=en), [Gemma 4 com imagem/system](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api), [Gemma 4 na Agent Platform](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it).
