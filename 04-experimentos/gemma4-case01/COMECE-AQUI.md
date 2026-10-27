# Piloto jurídico-visual CASE01 - Google / Gemma 4

**Pacote preparado para execução pela usuária. Nenhum candidato ou experimento de Gemma foi executado nesta entrega.** Uma fotografia pública inspecionada, dois prompts de condição e uma regra hipotética exercitam imagem → premissa factual → classificação verbal → conclusão condicionada à regra.

## Uso rápido no Google AI Studio

1. Extraia o ZIP no computador. **Não envie o ZIP inteiro nem `evaluator-only` ao modelo.**
2. Abra [Google AI Studio](https://aistudio.google.com/) no Playground, em uma conversa nova. Escolha uma variante **Gemma 4** que aceite imagem e esteja disponível em sua conta. Os IDs documentados na Developer API são `gemma-4-31b-it` e `gemma-4-26b-a4b-it`; registre a variante efetivamente selecionada.
3. Em **Run settings**, cole `model-input/system.txt` em **System Instructions**, quando esse controle estiver disponível para o modelo escolhido. Se não houver campo, cole esse texto antes do prompt e registre `system_mode=prepended_user_text`; não trate as duas formas como equivalentes.
4. Para a condição `with_image`, anexe individualmente **`model-input/images/case01.jpg`** usando o controle de mídia da interface; cole **`model-input/conditions/01_with_image.txt`** no campo de texto. Não use a imagem original de `evaluator-only`.
5. Registre modelo/versão/data/configuração antes de clicar **Run**. Preserve a primeira resposta integral e eventuais erros. Não forneça correções ou gabarito nessa conversa.
6. Em outra conversa nova, com o mesmo modelo e configuração, cole **`model-input/conditions/02_without_image.txt`**, **sem imagem** e sem histórico da primeira condição. Use o mesmo system prompt.
7. Salve as saídas brutas em `evaluator-only/results/raw/`. Registre a execução nos templates. Só depois compare as respostas com a anotação provisória, que Ana deve revisar.

O caminho recomendado é **JSON solicitado pelo prompt + validação local**. `model-input/output.schema.json` é um contrato JSON Schema padrão; não é um workflow importável. Não presumimos que o controle de schema esteja disponível para Gemma 4 na sua interface. Se ele existir e aceitar o schema, registre o modo e qualquer ajuste. Não habilite busca, execução de código, ferramentas ou recuperação de arquivos externos neste caso.

## Registro e conferência

- Copie `evaluator-only/results/run-record.template.json` para um arquivo novo por condição e preencha modelo, versão, produto/endpoint, horários, configuração e hashes. Nunca registre chaves ou tokens.
- `results.csv` contém apenas cabeçalho; `results.jsonl` está vazio. São espaços para resultados futuros.
- Checker local, sem instalação ou rede:

```sh
python3 -I -B evaluator-only/tools/validate_candidate.py --candidate evaluator-only/results/raw/with_image.json --condition with_image
python3 -I -B evaluator-only/tools/validate_candidate.py --candidate evaluator-only/results/raw/without_image.json --condition without_image
```

Se a resposta incluir markdown ou JSON inválido, mantenha a resposta original e registre a falha. Uma cópia extraída para parsing deve ser outro arquivo, com transformação descrita; não corrija valores silenciosamente. O checker confere formato/vinculação/política de evidência, não verdade dos pixels ou validade jurídica.

## Outra plataforma de agentes do Google

O mesmo núcleo de arquivos é portável. A **Gemini Enterprise Agent Platform** documenta `gemma-4-26b-a4b-it-maas`, experimental, com imagens e saída estruturada, mas sem Thinking nesse endpoint. Ele é distinto dos IDs da Developer API. O guia de schema da plataforma requer API para esse recurso; não prometemos importação de schema pelo console. Use `PORTABILIDADE.md`. Nenhum endpoint foi criado, ativado ou usado nesta entrega.

## Limites

É um único caso com regra fictícia, não aplicação de direito vigente ou benchmark. A referência foi preparada por assistente multimodal exposto à fonte e permanece **anotação provisória, revisão humana pendente**. A cor é uma pergunta factual sem resposta no texto. A definição de categoria inclui critérios, mas não afirma que A os satisfaz. Sem pixels, espera-se abstenção factual e ausência de conclusão normativa sobre A.

Fonte/licença e atribuição acompanham a fotografia em `evaluator-only/ATRIBUICAO.md`. A imagem fornecida ao modelo tem nome neutro e Exif descritivo removido; os dados comprimidos da imagem e o perfil ICC permanecem idênticos. Não acrescente documentos privados de processos. Verifique os termos e condições de uso da plataforma selecionada antes de executar.

## Documentação oficial consultada em 13/10/2026

- [AI Studio: Playground, System Instructions e Run](https://ai.google.dev/gemini-api/docs/ai-studio-quickstart?hl=en).
- [Gemma 4 na Developer API: modelos, imagens e system instructions](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api).
- [Gemma 4 na Gemini Enterprise Agent Platform](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it).
- [Schema na Agent Platform: uso por API](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/control-generated-output).

Os nomes exatos dos botões de anexo e os controles disponíveis na conta de Ana não foram inspecionados. O pacote fornece arquivos e instruções manuais, sem importador de workflow universal.
