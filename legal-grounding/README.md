# Piloto jurídico documental: evidência visual → fatos → símbolos

Extensão independente para Ana Vitória e Guilherme, INE410159 / Grupo 26. Entrega: casos e mecanismo executáveis, não resultados de modelos. Nenhum arquivo remoto, issue, branch, planilha ou métrica do projeto original foi modificado.

## O que está pronto

Três documentos oficiais, PDFs de origem preservados, primeira página renderizada em PNG e inspecionada visualmente; seis fatos anotados com regiões normalizadas; três referências formais; adaptador que reutiliza as quatro configurações; avaliação independente; 12 testes locais aprovados; 36 solicitações preparadas com ordem aleatória determinística. As anotações foram feitas pelo assistente a partir das páginas, não fornecidas pelos tribunais. Exigem duas revisões humanas independentes e adjudicação antes de resultados científicos. Não chamar o gabarito de anotação jurídica oficial.

## Fontes investigadas e decisão

| Fonte primária | Natureza e anotações | Acesso/reutilização | Decisão |
|---|---|---|---|
| IIT-CDIP / NIST, DOI 10.18434/mds2-2531 | Documentos de origem em litígios do tabaco, scans TIFF e OCR; acervo documental com componentes visuais e textuais, não benchmark pronto de grounding ou argumentos jurídicos | Catálogo público aponta arquivos e política NIST. A tentativa de baixar o README nesta sessão terminou em HTTP 524. Nenhuma imagem individual do CDIP foi obtida/inspecionada. Proveniência de litígio não torna cada documento um ato jurídico; política geral NIST não resolve automaticamente direitos de terceiros | Investigar depois com um documento individual, seu identificador, imagem, licença e alinhamento OCR/página verificados. Nenhum caso CDIP inventado |
| U.S. Courts, AO 440, AO 441 e AO 399 | Formulários jurídicos oficiais visualmente estruturados; PDFs com texto e layout, sem anotações de argumento ou evidência | Três PDFs baixados e visualmente conferidos. Base de reutilização: obra oficial do governo federal dos EUA e 17 USC 105, sem anexos privados incorporados. Preservar atribuição; não alegar licença CC nem que toda imagem de um site judicial seja livre | Núcleo de três casos adaptados; avaliação de texto visual e associação espacial campo–papel |
| FUNSD, autores/EPFL | Dataset originalmente de entendimento de formulários: imagens, texto, caixas e relações anotadas. Sua tarefa não é argumentação jurídica nem todos os formulários são documentos jurídicos | Página dos autores contém descrição, download e termos de uso para pesquisa não comercial; conferir esses termos antes de integrar imagens | Bom baseline de relações e localização; fora do pacote de imagens atual |
| CUAD / The Atticus Project | Benchmark de revisão de contratos; perguntas e trechos contratuais, não evidência visual localizada | Fonte do projeto oferece documentação e dados. Não foi realizada auditoria de licença de cada PDF nesta sessão | Usar como referência textual; exigiria selecionar PDFs e criar alinhamento visual revisado. Não classificado aqui como dataset visual pronto |
| NARA | Arquivos documentais digitalizados; seleção de itens poderia fornecer atos e documentos históricos | NARA adverte que nem tudo em seus acervos é domínio público. Direitos devem ser examinados por item | Reserva para ampliar diversidade; nenhum item selecionado agora |
| STF-piloto-visual-001.zip, material anterior | Fotografia de A Justiça extraída da p. 32 de relatório institucional, com referência factual preliminar e limites jurídicos explícitos | Material recuperado e lido nesta tarefa. Seu provenance.json registra licença não identificada e autoria fotográfica desconhecida | Reaproveitamento metodológico; imagem não redistribuída neste pacote e caso fora da pontuação nova |

Fontes e links diretos:

- NIST: https://catalog.data.gov/dataset/complex-document-information-processing-cdip-dataset
- Política NIST: https://www.nist.gov/open/license
- AO 440: https://www.uscourts.gov/sites/default/files/ao440.pdf
- AO 441: https://www.uscourts.gov/forms-rules/forms/summons-third-party-complaint
- AO 399: https://www.uscourts.gov/forms-rules/forms/waiver-service-summons
- Copyright Office, §105: https://www.copyright.gov/title17/92chap1.html#105
- FUNSD: https://guillaumejaume.github.io/FUNSD/description/index.html e https://guillaumejaume.github.io/FUNSD/work/
- CUAD: https://github.com/The-Atticus-Project/cuad e https://www.atticusprojectai.org/datasets/
- NARA: https://www.archives.gov/research/still-pictures/permissions

## Casos e referências esperadas

A evidência não é a simples ocorrência de uma palavra em qualquer lugar da página. É a relação entre o rótulo do campo `To`, o papel processual impresso e a área de nome não preenchida. Isso é relevante porque um formulário contém vários papéis processuais simultaneamente. A existência de palavras como Plaintiff e Defendant no cabeçalho não determina quem é o destinatário do campo.

| ID | Imagem / proveniência | Entidades e relação visual | Fatos esperados | Limite |
|---|---|---|---|---|
| LEGAL01 | AO 440, p. 1, `images/ao440.png` | documento doc1 → campo To → defendant; espaço de nome vazio | `printed_recipient_role(doc1,defendant)` e `blank_recipient_name(doc1)` | Não identifica pessoa nem prova citação realizada |
| LEGAL02 | AO 441, p. 1, `images/ao441.png` | doc1 → campo To → third_party_defendant; espaço de nome vazio | `printed_recipient_role(doc1,third_party_defendant)` e `blank_recipient_name(doc1)` | Não confundir com o réu/autor da demanda de terceiro no cabeçalho |
| LEGAL03 | AO 399, p. 1, `images/ao399.png` | doc1 → campo To → plaintiff_attorney_or_unrepresented_plaintiff; linha de nome vazia | `printed_recipient_role(doc1,plaintiff_attorney_or_unrepresented_plaintiff)` e `blank_recipient_name(doc1)` | Texto pré-impresso em primeira pessoa não prova renúncia assinada |

Conclusão operacional comum: `recipient_identity_undetermined(doc1)`. Significa apenas que o campo examinado não identifica nominalmente uma pessoa. Não significa que não exista destinatário no mundo.

Exemplo LEGAL01:

```text
[printed_recipient_role(doc1,defendant),blank_recipient_name(doc1)],recipient_identity_undetermined(doc1)
```

Sem imagem, referência de comportamento adequada: `[],undetermined(visual_facts,doc1)`. O gabarito da conclusão documental usado pela métrica semântica original permanece igual entre condições; a abstenção é avaliada separadamente. Portanto, uma abstenção correta pode receber semântica negativa no critério original. Não corrigir esse resultado alterando a métrica.

`cases.json` contém caixas XYXY normalizadas em [0,1], transcrição do rótulo, região vazia, fontes, hashes, entimema, contexto e fórmula esperada. PDFs, nomes dos arquivos, fontes e caixas de referência são exclusivos do avaliador. O gerador recebe apenas prompt e bytes da imagem apropriada. Não recebe PDF, casos.json, README ou gabarito. Os três prompts textuais são iguais entre documentos dentro da mesma condição: não revelam qual formulário está sendo mostrado.

## Desenho e compatibilidade

Snapshot verificado: `d374ac21ca0645c4a49e8ad719a1845afe8754f7`, repositório https://github.com/GuiT2002/comma2026-multimodal-argumentation . Hashes de main.py, validation.py e all_examples.txt estão em upstream.json. Não redistribuímos código do repositório, que não apresenta licença identificada.

| Identificador original | Entradas |
|---|---|
| without_enthymeme | imagem + contexto |
| without_context | entimema + imagem |
| without_image | entimema + contexto |
| all_inputs | os três elementos |

Não forçamos documentos jurídicos nas classes geográfica/temporal/geográfica-temporal. O adaptador usa os construtores de prompt e a função request_model existentes, com um contrato adicional de vocabulário e abstenção idêntico entre condições; os resultados da extensão ficam separados. Isso preserva a mecânica do pipeline, mas não é uma réplica sem alteração do prompt nem uma comparação direta com os números meteorológicos.

O critério `scheme_correct` é chamado sem alteração. Nenhum falante foi fornecido nestes casos, portanto não fabricamos um para preencher Position to Know: as referências documentais recebem `scheme_correct=False`. Essa métrica é mantida para transparência e não é uma expectativa normativa de sucesso nesta tarefa. A métrica semântica usa opcionalmente a função `validation.semantic_correct` original, com o mesmo prompt e modelo juiz do snapshot. Não alterar statistics.py nem incorporar estes casos aos seus denominadores.

A conclusão é igual nos três casos de propósito: correspondência da conclusão pode coexistir com troca do papel processual na premissa. É um teste mínimo do problema da avaliação existente, não uma avaliação ampla de argumentação jurídica.

## Avaliação adicional independente

1. **Forma original:** presença dos três predicados, função original, sem substituição.
2. **Semântica original:** juiz original compara apenas conclusões, se executado. Null significa não executado, nunca reprovação.
3. **Fatos e suporte de entrada:** correspondência exata com os fatos de referência; átomos desconhecidos são sinalizados. Acerto factual sem imagem não conta como suporte visual. Conclusão derivada exige as duas premissas e imagem.
4. **Localização:** evidência independente por átomo, com hash da imagem, página e caixa. Exige IoU ≥ 0,5 com a região revisada; caixa de página inteira não basta. Sem evidência fornecida, não se certifica localização. Sem imagem, localização é não aplicável, não zero.

As caixas devem ser registradas por um avaliador olhando a imagem e a resposta, sem copiar o gabarito; depois se mede sobreposição. Use evidence-template.json como formato, anexando `evidence` a cada registro real em uma cópia `reviewed.jsonl`. Registre reviewer_id e versão da anotação. Não modifique a resposta do modelo durante essa revisão. É uma avaliação assistida por referência e revisão humana: o script não olha pixels nem prova automaticamente que uma caixa implica um fato. Um modelo pode acertar por memória e citar a caixa depois; o controle sem imagem e os contrastes entre documentos ajudam a investigar isso, sem provar causalidade por si sós.

Precisão factual = fatos de referência recuperados / (fatos recuperados + átomos fora do vocabulário autorizado). Recall factual = fatos recuperados / 2. Conclusão derivada e abstenção são relatadas à parte. Precisão localizada = fatos recuperados e corretamente localizados / (fatos recuperados + átomos não autorizados), nas condições com imagem; recall localizado = localizados / 2. Esses números são provisórios enquanto o gabarito não for adjudicado. Sintaxe não reconhecida recebe parse_error, não crédito parcial silencioso.

Vocabulário fechado e correspondência exata limitam a avaliação: paráfrases ou símbolos alternativos podem ser semanticamente aceitáveis e falhar aqui; mantenha também a métrica semântica e adjudique exemplos. Uma resposta que só fornece a conclusão correta não tem recall dos fatos.

## Execução reproduzível

Descompacte o pacote em uma pasta de trabalho. A partir da pasta que contém legal-grounding:

```bash
git clone https://github.com/GuiT2002/comma2026-multimodal-argumentation.git upstream
git -C upstream checkout d374ac21ca0645c4a49e8ad719a1845afe8754f7
python3 -m unittest discover -s legal-grounding/tests -v
python3 legal-grounding/adapter.py prepare --upstream upstream > prepared.jsonl
```

Os testes usam só biblioteca padrão e arquivos de origem. As imagens incluídas dispensam renderização local. Foram renderizadas com PyMuPDF, matriz 1,5, RGB, página completa sem edição. Upstream e assets são checados por SHA-256 antes da preparação/execução.

Para chamadas reais, instale o SDK apropriado indicado no requirements.txt do upstream e configure sua chave de API no ambiente. O nome exato do modelo é obrigatório e deve ser um modelo com suporte à imagem no provedor escolhido. O programa não testa nem promete capacidades de um modelo a partir do nome. Cada chamada constitui uma sessão independente, sem navegação e sem respostas anteriores. Não reutilizar o mesmo arquivo de saída: a abertura exclusiva impede sobrescrita.

```bash
python3 legal-grounding/run.py --upstream upstream --provider openai --model MODELO_MULTIMODAL --repeat 3 --out responses.jsonl
python3 legal-grounding/adapter.py metrics --upstream upstream --responses responses.jsonl > original-metrics.jsonl
# Opcional: executa o juiz semântico original; requer DEEPSEEK_API_KEY e o SDK openai.
python3 legal-grounding/adapter.py metrics --upstream upstream --responses responses.jsonl --semantic > original-metrics-with-judge.jsonl
# Após a revisão de evidências em uma cópia dos registros:
python3 legal-grounding/grounding.py reviewed.jsonl > visual-grounding.jsonl
```

run.py guarda respostas brutas, saída final, modelo, provedor, data UTC, prompt, condição, repetição, imagem/hash e política de parâmetros. Erros de transporte/extração permanecem registrados; reportar sua contagem separada. Não tratá-los como acertos ou removê-los silenciosamente. O gerador não recebe caixas; estas entram apenas na etapa de avaliação, sem mudar o contrato de saída original. A opção de juiz semântico faz chamadas pagas quando executada; não foi executada nesta entrega.

36 entradas = 3 documentos × 4 configurações × 3 repetições, não 36 casos independentes. A condição sem imagem tem entrada idêntica para os três documentos: é um controle compartilhado, não três problemas textuais diferentes. Não usar essas duplicações como observações independentes para significância. Reportar por documento e por condição, contagens e variabilidade. Não calcular um escore jurídico global.

## Reaproveitamento dos materiais anteriores

O STF fornece um bom caso futuro de relação espacial objeto–marcas–torso; seu esperado não comprova autoria, intenção, material, dano permanente ou culpa. Seu manifesto já advertia sobre direitos não esclarecidos. Mantivemos essa fronteira, sem redistribuir a imagem e sem fingir que é a mesma peça probatória dos autos. O brainstorming de 13/10 também orienta distinguir ausência de informação de refutação e separar percepção de inferência.

O relatório exploratório anterior propunha controles que não eram as quatro configurações reais do pipeline e generalizava permissões de imagens oficiais/imprensa. Essas afirmações não são herdadas como evidência. Muro, janela e acessibilidade continuam hipóteses de novos casos; nenhuma imagem ou anotação ausente foi fabricada para preenchê-los.

## Limites e próxima rodada

Este núcleo verifica extração de papéis e lacunas em documentos processuais. Não mede autenticação, interpretação do direito vigente, reconstrução completa de argumento jurídico ou visão de cenas físicas. OCR com layout é um baseline pertinente, ainda não executado; OCR simples pode resolver parte do problema. Não se alega ganho do multimodal sobre OCR.

Antes da aula: dois anotadores revisam rótulos/caixas independentemente, adjudicam divergências e congelam uma versão. Depois executar 36 chamadas por modelo, revisar evidências cegamente e comparar os pares all_inputs/without_image. Avaliar as trocas de papel entre documentos com prompts idênticos. Essa troca natural entre imagens originais dispensa imagens sintéticas. O pacote não inclui máscara, contrafactual editado ou novo negativo fotográfico. Ampliar em seguida com um documento CDIP individual verificável e um documento jurídico preenchido com reutilização e dados pessoais adequadamente resolvidos, sem inferir fatos de execução a partir de modelos em branco.

## Inventário

- cases.json: referências, evidências e proveniência, somente avaliador.
- images/ e sources/: PNGs de entrada e PDFs oficiais completos de origem.
- requests.jsonl: entradas preparadas; não respostas.
- adapter.py: prompts e métricas originais importados do snapshot.
- run.py: execução opcional com provedor/modelo explícitos.
- grounding.py: validação adicional independente.
- evidence-template.json: contrato de evidência para revisão.
- tests/: testes e registro de verificação local.
- results/README.txt: estado explícito de ausência de rodada de modelos.
- upstream.json e MANIFEST-SHA256.json: fixação de código e integridade dos arquivos.
