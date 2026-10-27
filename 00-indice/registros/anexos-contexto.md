# Contexto dos dois anexos HTML

Revisão local em 13/10/2026. Os arquivos foram lidos como dados UTF-8, por inspeção do texto-fonte e análise estática de elementos e referências. Não houve renderização, execução do JavaScript, navegação ou download de dependências. Os originais não foram editados.

## Identidade e classificação

| Arquivo | Bytes | SHA-256 | Classificação |
|---|---:|---|---|
| `explicador_visao_computacional.html` | 18.118 | `ac9ce49357a77017a69f3e0c243297b4182e878660468c5ec01dfcb0109c6ef1` | Material didático; demonstração sintética |
| `TRABALHO DE VISAO COMPUTACIONAL 3f4158101a0580ad812af4fdad40b193.html` | 28.680 | `ded27415ef218a7cd750ff0c60eb681e3adc7c21539b28482f758ba708fe7fbf` | Registro histórico da reunião de 08/10/2026 |

Os tamanhos correspondem aos valores esperados. Nenhum dos dois HTML contém literalmente o código `INE410159`. A associação com a disciplina vem do contexto desta organização; não foi extraída de um identificador interno dos anexos. Nenhum arquivo constitui resultado experimental novo do projeto. O material didático usa uma cena desenhada em código; o histórico relata trabalho anterior de terceiros e possibilidades de pesquisa.

## Explicador didático

Título do documento: **Explicador interativo — Visão Computacional**. Título principal: **Como uma imagem vira uma decisão reprodutível?**. Não há data de criação, revisão, reunião ou prazo registrada no conteúdo. A data local de importação não permite datar sua autoria.

Seções preservadas no texto-fonte:

1. O fluxo mental da disciplina.
2. Laboratório visual: limiarização.
3. Três ideias que aparecem por trás da técnica.
4. Questionário rápido.
5. Resumo em uma frase.

O conteúdo pertinente à INE410159 apresenta a sequência dataset → características → métrica → baseline → reprodutibilidade. Menciona cor, textura, forma, bordas e embeddings como representações; euclidiana, Manhattan, cosseno e Jaccard como possibilidades de comparação; e a necessidade de registrar parâmetros, código, checkpoints e resultados.

A demonstração estática de código desenha uma cena sintética em dois elementos `canvas` e calcula uma máscara por distância RGB em relação a uma cor-alvo. O limiar é ajustável, com valor inicial 72 e intervalo de 18 a 150. Ela ilustra sensibilidade à iluminação, saturação e falsos positivos; não oferece dataset de pesquisa, métricas de desempenho ou resultado validado. Não foi executada nesta revisão.

Os cartões conceituais sobre espaços de cor (RGB e HSV/HSI/HSL), texturas (Gabor) e imagem como premissa estão em strings do JavaScript embutido. Os detalhes das etapas também aparecem em atributos `data-detail`. Uma extração que descarte todos os scripts e atributos sem registrar esses textos perderá parte da explicação. É possível produzir uma leitura textual por extração estática dessas strings, sem executar código.

Há um questionário de quatro itens sobre baseline, métricas, riscos de threshold e reprodutibilidade. A pontuação inicial e o feedback são mecanismos pedagógicos; não medem desempenho experimental do projeto.

## Registro histórico da reunião

Título do documento e título principal: **TRABALHO DE VISAO COMPUTACIONAL**. Subtítulo: **Reunião de Pesquisa: Argumentação Computacional e Aplicações Jurídicas**. A data está explicitamente registrada como `datetime="2026-10-08"`, correspondente a 8 de outubro de 2026. O arquivo tem estrutura e identificadores de exportação de uma página do Notion; isso não comprova acesso atual à página de origem ou à sua história de versões.

Seções preservadas:

1. Visão geral.
2. Argumentação computacional.
3. Trabalho anterior e método apresentado.
4. Possíveis aplicações jurídicas.
5. Encaminhamentos.
6. Prazos mencionados.
7. Questões em aberto.

A reunião registra uma possível colaboração entre direito e argumentação computacional: usar texto e imagem para reconstruir premissas omitidas em argumentos, mantendo rastreabilidade e verificando se o modelo acrescenta informação não sustentada. Discute esquemas como Expert Opinion / Position to Know e a adaptação de referências de Common Law ao contexto brasileiro de Civil Law. Propõe exemplos simples e controlados, escolhidos conforme disponibilidade de evidência visual. Os exemplos jurídicos são possibilidades de pesquisa; este relatório não os trata como casos reais ou como fatos provados.

O relato do trabalho anterior menciona mais de 400 casos de teste, um domínio meteorológico, condições com retirada de contexto, entimema ou imagem, além da condição completa. Cita DeepSeek, Claude (Sonnet) e tentativas com modelos da OpenAI. São afirmações históricas do registro de reunião: faltam identificação bibliográfica, dados e saídas para reproduzi-las ou atribuí-las ao projeto atual. Não devem ser incorporadas como resultados obtidos na INE410159.

Os encaminhamentos abrangem pesquisa bibliográfica e de datasets, identificação do livro-base, compartilhamento de artigos mediante confirmação do orientador, definição de canal de contato, eventual reunião com o orientador e conferência da planilha da disciplina. Os nove itens estão representados como caixas desmarcadas e desabilitadas no export. Isso preserva o estado registrado, sem demonstrar o andamento atual das tarefas.

Prazos **mencionados na reunião**, cuja validade atual não foi conferida em uma fonte oficial:

| Marco | Data registrada | Limite da evidência |
|---|---|---|
| Apresentação presencial | 02/12/2026 | O próprio registro encaminha conferir a planilha da disciplina |
| Entregas finais: PDF, GitHub, vídeo, post e checkpoint da rede neural | Até 05/01/2027 | Registro histórico; não confirma o calendário atual |

Continuam abertas no documento a escolha do esquema, do dataset, da adaptação jurídica e do critério para avaliar reconstrução correta de premissas. A referência multimodal assistida para o piloto permanece provisória no contexto desta organização; esses anexos não justificam promovê-la a referência validada. O experimento 0 permanece parado, conforme o estado informado para a tarefa; a inspeção dos HTML não executou nem retomou experimentos.

## Referências e lacunas de preservação

| Origem | Referência encontrada | Natureza | Situação na revisão |
|---|---|---|---|
| Explicador | Nenhum `href`, `src`, `@import` ou `url(...)` externo ou relativo | Código e CSS embutidos | Sem dependência de arquivo externo identificada no texto-fonte |
| Histórico, linha 797 | `https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex-swap.min.css` | `@import` CSS remoto | Não baixado; dependência de aparência fora dos bytes do HTML |
| Histórico | Favicon e dois ícones de checkbox em `data:image/svg+xml` | Dados embutidos | Preservados nos bytes; não dependem de um arquivo local separado |
| Histórico | Google Scholar, Hugging Face e denominação “Argumentation and Law” | Menções textuais | Sem URLs ou identificação bibliográfica conferida |
| Histórico | Livro-base; trabalho anterior; artigos de esquemas jurídicos; artigo atribuído a Carlos | Menções a materiais | Sem título completo, DOI, URL, arquivo ou anexo neste export |
| Histórico | Planilha da disciplina | Menção a fonte de calendário | Sem URL ou cópia anexa |

Não foram encontrados links relativos, `href` de âncora, imagens anexadas por `src` ou vínculo HTML entre os dois documentos. Não há portanto um alvo relativo quebrado a restaurar a partir desses HTML. As referências bibliográficas ausentes são lacunas documentais, não links locais comprovadamente quebrados. A menção a um artigo enviado na reunião não comprova que seus bytes estejam nestes anexos.

A folha remota de KaTeX pode, por sua vez, referenciar outras dependências; seu conteúdo não foi obtido, então elas não foram inventariadas. O texto da reunião está embutido no HTML, mas não há garantia de aparência idêntica em uma renderização offline. A revisão não testou renderização ou comportamento interativo.

Preservar os dois HTML originais e seus hashes mantém o texto-fonte e os dados embutidos. Leituras TXT ou Markdown são derivados de consulta e não substituem esses originais. Os hashes demonstram identidade de bytes nesta inspeção; não demonstram, sozinhos, cópia independente, restauração de backup, histórico completo do Notion ou preservação dos materiais apenas citados.

Este relatório limita-se aos dois anexos indicados. A ausência de um material neles não prova que ele inexista em outras pastas, no Notion ou em outra biblioteca. Nenhum novo caso real sensível, dado de fórum ou credencial foi acrescentado aos derivados desta revisão.
