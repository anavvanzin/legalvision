# Parecer de inventário — organização jurídica visual

Inspeção de 13/10/2026, somente leitura das fontes. A escrita desta subtarefa limita-se a `organization-review/`. Não houve execução de scripts do projeto, instalação, API, inferência, push, movimentação, exclusão ou alteração das fontes. Não foram consultados conteúdos de credenciais ou sessões privadas. `.git`, `.library`, caches, dependências e a árvore pesada `preflight/checkout` ficaram fora do inventário.

**Conclusão:** há material suficiente para um projeto central com índice, cópias documentais rastreáveis e evidências leves. As duas pastas jurídicas originais contêm a mesma versão. O piloto permanece pausado; os resultados históricos meteorológicos e os checks de software devem conservar sua identificação própria. Os erros de setup do AI Studio informados no contexto não constituem resultados de modelo; não há arquivo de resposta candidata nas entregas inventariadas.

## Estado que o índice deve mostrar

| Conjunto | Estado verificável | Evidência local |
|---|---|---|
| Protótipo jurídico | Check de integridade registrado com exit 0: 10 esquemas, 2 perfis propostos, 16 oráculos (7 VC, 9 WT). Os 10 esquemas têm `executable=false`. Os oráculos são especificações, não respostas de modelo nem suíte jurídica executada. | `evidence/legal-package-check.json`; `work/legal-package/schemes/`; `tests/acceptance-cases.json` |
| Parecer formal | Registra a ambiguidade WT07 (`structure=fail` com `argument_status=defeated`) e a necessidade de distinguir os objetos avaliados. | `formal-review.md` |
| Referência COMMA | 90 casos meteorológicos: 64 geográficos, 15 temporais, 11 mistos; 2 modelos × 4 condições = 720 julgamentos arquivados, 24 CSVs. 657 presenças lexicais positivas e 227 correspondências semânticas positivas. Nenhuma nova inferência ou adjudicação semântica nesta auditoria. | `reference-audit/RESULTADOS-REFERENCIA.md`; `inventory-and-audit.json`; `recomputed-metrics.csv` |
| Preflight Mac | Dry-run aprovado, 0 pares pendentes; exit global 1 apenas por SDKs ausentes. Integridade antes/depois idêntica. A presença/assinatura de 90 PNGs foi conferida; DGX não foi verificado. | `preflight/run.json`; `run.log`; `inputs-before.sha256`; `inputs-after.sha256` |
| Piloto CASE01 | Um caso, regra hipotética, duas condições preparadas. 0 candidatos; pausa mantida por orientação de Ana. A referência é anotação assistida provisória, com revisão humana pendente. | `pilot-2026-10-13/protocol-preparation.json`; `reference/gold.json`; `reference/delivery-amendment.json` |
| Pacote Google/Gemma | Preparado, 44 arquivos, 0 candidatos. `results.csv` contém só cabeçalho; `results.jsonl` tem 0 bytes; `raw/` contém só README. Seis testes sintéticos de software registrados como aprovados, sem avaliação visual/jurídica. | `google-gemma4-package-2026-10-13/execution-plan.json`; `evaluator-only/checks/package-checks.json`; `evaluator-only/results/` |
| Publicação GitLab | Não confirmada nesta entrega. Uma referência remota ou um 404 de projeto privado não comprova publicação ou ausência. | `RESULTADOS-INE410159-2026-10-13.md` |
| AI Studio | Preparação documental e erros de configuração comunicados no contexto. Estes não representam respostas de candidato, avaliação do modelo ou evidência de desempenho. | Ausência de resultados candidatos nas entregas; notas de preparação em `pilot-2026-10-13/GOOGLE-AI-STUDIO-NOTES.md` |

O check de polaridade registra quatro linhas booleanas e dois contraexemplos. A menção a Wolfram no stdout é histórica; não demonstra chamada nova ao serviço. O checker do piloto confere contrato, vínculo de termos e política declarada de evidência; não lê os pixels nem certifica validade jurídica.

## Quantidades e retenção

Contagens deste recorte, sem somar cópias idênticas como versões independentes:

| Local | Arquivos contados | Bytes | Tratamento recomendado |
|---|---:|---:|---|
| Raiz da entrega `task-2` | 10 | 755.084 | Guias, relatórios, apresentação, dois ZIPs, dois recibos/verificações e manifesto. |
| `reference-audit/` | 10 | 48.544 | Copiar como evidência leve de linha de base histórica. |
| `evidence/` | 6 | 5.208 | Copiar como evidência leve de checks/proveniência. |
| `work/legal-package/` | 15 | 56.304 | Cópia documental do protótipo; sem histórico Git. |
| `pilot-2026-10-13/` | 20 | 513.902 | Preservar como preparação pausada, com referência provisória. |
| `google-gemma4-package-2026-10-13/` | 44 | 718.423 | Preservar inteiro, mantendo `model-input` separado de `evaluator-only`. |
| `preflight/`, fora do checkout | 13 | 120.674.888 | Dos 13, 12 são leves: 98.888 bytes. O 13º é o snapshot TAR pesado. |
| `preflight/tracked-snapshot.tar` | 1 | 120.576.000 | Manter na origem, indexar por caminho/hash; não integrar à cópia leve. |
| `preflight/checkout/` | Não recontado | Não percorrido | `run.json` registra 138 entradas e 120.461.375 bytes; indexar sem duplicar. |

Os 118 arquivos do recorte estão descritos em `task-inventory.json`; ele inclui o registro do TAR, mas não o conteúdo do checkout. Caches e arquivos criados pela própria organização foram excluídos. O relatório de origem já registra 135 arquivos pertinentes da referência COMMA; esta subtarefa não os copiou nem recontou.

## Identidade, divergências e originais documentais

As pastas `repo-root:.` e `repo-root:. 2` têm, cada uma, **14 arquivos documentais idênticos, 53.770 bytes: 8 Markdown, 5 JSON e 1 TXT**. Incluindo o bundle, `.gitignore` e `scripts/check_package.py`, são **17 arquivos úteis idênticos, 80.025 bytes**. Os totais brutos são 21 e 19, respectivamente: duas `.DS_Store` divergem e outras duas existem só na pasta sem “ 2”. Esses metadados do Finder não são versões documentais.

Documentos relevantes: `COMO-ABRIR.txt` na raiz externa e, na árvore interna `legal-visual-argumentation/`, `README.md`, `docs/apresentacao.md`, `docs/auditoria.md`, `docs/correcoes.md`, `docs/notion-edits.json`, `docs/validacao.md`, `docs/verificacao.md`, o plano e o desenho de piloto de 12/10, `schemes/catalog.json`, `schemes/profiles.json`, `sources/manifest.json` e `tests/acceptance-cases.json`.

Os **15 arquivos internos** são idênticos aos 15 em `work/legal-package/` e aos 15 hashes de `evidence/legal-source-sha256.json`: nenhuma ausência, extra ou divergência. O bundle original tem SHA-256 `85bc89fc5c500f68a458de7ffa27b1a88e6f8f0b8207568ea3ab8a4c599f9452`; deve continuar na origem e receber referência no índice, sem copiar o histórico para o projeto central.

Não há PDF/DOCX nessas duas pastas. O manifesto cataloga três PDFs como anexos Notion, todos `redistributed=false`:

| ID | Original registrado | Bytes | SHA-256 |
|---|---|---:|---|
| R1 | `LegalReasoningWithArgumentationSchemes.pdf` | 435.109 | `f2138e982dad15f736c9932c6ee0b5ec1495114044dbe0a76f885934f202c050` |
| R2 | `ArgumentSchemesforLegalCaseBasedReasoning.pdf` | 73.351 | `08238229382b90b1196896bb419d1b897de6d17d05c288044bc71000370d3cda` |
| R3 | `UsingArgumentationSchemesToFindMotivesAndIntentionsOfARationalAgent.pdf` | 868.078 | `f304659ed4411e935b35eed01b665ef8899bdf61267676b0a0a1daa8a77d9eb1` |

O índice bibliográfico deve preservar os três destinos `notion-file-block://` do manifesto e declarar que os PDFs não acompanham o pacote. Não se verificou novamente o conteúdo remoto desses anexos.

Há 25 grupos de hashes repetidos no recorte da tarefa, dos quais um agrupa quatro arquivos vazios. Vazio não significa execução de candidato. Repetições materiais de interesse:

- `GUIA-RAPIDO-GEMMA4-2026-10-13.md` é idêntico a `google-gemma4-package-2026-10-13/GUIA-RAPIDO.md`.
- O parecer formal e sete arquivos jurídicos de `evaluator-only/background` repetem os correspondentes de `formal-review.md` e `work/legal-package/`.
- Referências congeladas, original JPEG, ferramentas/checks e schema do pacote Google repetem seus correspondentes do piloto, com hashes iguais. Isto não representa outra execução.
- `preflight/inputs-before.sha256` e `inputs-after.sha256` são idênticos, como esperado pela preservação das entradas.

A imagem de `model-input/images/case01.jpg` difere do original apenas pela remoção documentada de 92 bytes de metadados APP1: 278.291 contra 278.383 bytes. `model-image-lineage.json` registra identidade do scan comprimido e preservação de ICC. Conservar as duas funções e hashes; não tratar a diferença como nova cena ou editar novamente o original.

Os dois ZIPs correspondem byte a byte aos arquivos atuais associados: `RESULTADOS-INE410159-2026-10-13.zip` tem 45 membros/85.679 bytes; `PACOTE-GOOGLE-GEMMA4-INE410159-2026-10-13.zip` tem 44 membros/622.865 bytes. Zero membros ausentes ou divergentes na comparação independente, registrada em `archive-comparison.json`.

Duas identificações de commit devem manter funções distintas: `sources/manifest.json.repository_commit=d374ac…` referencia o COMMA consultado; `evidence/legal-package-check.json.bundle_commit=16919e…` identifica o protótipo jurídico. A referência meteorológica também registra divergência entre a configuração Claude atual `claude-sonnet-5-5` e o cabeçalho das saídas arquivadas `claude-sonnet-4-6`; não atribuir o histórico ao modelo atual.

## Portabilidade e links

As duas pastas jurídicas originais têm **zero caminhos locais absolutos** nos documentos e três referências externas Notion. No recorte desta tarefa foram detectadas 92 ocorrências indicativas de caminhos absolutos em 16 arquivos leves; `task-inventory.json` registra os arquivos e destinos. Isso inclui comandos, proveniência e citações com número de linha, não somente links clicáveis.

O projeto central deve usar links relativos para suas cópias e um registro de origens para o que continuará fora dele. Não reescrever caminhos históricos em JSON/logs/manifestações: são evidência de como a execução ocorreu. Os pontos que exigem compensação pelo índice são:

| Referência absoluta/externalidade | Arquivos afetados | Índice necessário |
|---|---|---|
| `task-2/work/legal-package` e original jurídico interno | `formal-review.md`, relatório geral, evidências jurídicas | Ligação relativa às cópias em `03esquemas`, mais origem absoluta/hash para consulta no Mac. |
| `task-2/preflight/checkout` e snapshot | guias, `preflight/run.json`, capturador | Declaração de retenção externa em `06ambiente`; não sugerir que o checkout foi empacotado. |
| `comma2026-multimodal-argumentation` | relatório geral, auditoria da referência, logs/JSON estatísticos | Origem da linha de base histórica, commit, limites e localização externa. |
| `pilot-2026-10-13/stimulus` → imagem saneada do pacote | `model-image-lineage.json` | Preservar proveniência e oferecer links relativos às duas imagens dentro do pacote. |
| ZIP original/recibo Library | JSONs de verificação e evidência de arquivos originais | Ligação relativa ao ZIP copiado, mantendo os caminhos históricos e IDs como registro. |
| Anexos Notion | `sources/manifest.json` | Três entradas bibliográficas com hashes e `não redistribuído`; nenhuma promessa de PDF local. |
| Skill local citada como método | `formal-review.md` | Nota de método externo; não copiar plugin/configuração privada para o projeto. |

## Mapeamento proposto

Esta é uma proposta de destino para cópias e índices; a subtarefa não realizou a montagem. Manter o layout interno de cada pacote/árvore copiada e seus nomes originais para evitar quebrar importações e links relativos.

| Pasta central | Conteúdo principal | Critério de inclusão |
|---|---|---|
| `00indice/` | Página inicial, estado, mapa origem→cópia, inventário de hashes, lista das retenções externas | Um ponto de entrada, caminhos relativos para cópias, aviso visível de pausa e zero candidatos. |
| `01contexto/` | README jurídico, `COMO-ABRIR.txt`, `LEIA-ME-ENTREGA.md`, contexto de INE410159 e origem dos dois pacotes | Explica contribuição, versão e limites; sem sessões privadas. |
| `02bibliografia/` | `sources/manifest.json`, índice R1–R3 e URLs já documentadas | Referências documentais; PDFs externos não redistribuídos. |
| `03esquemas/` | Uma cópia integral documental de `work/legal-package/`, `formal-review.md` e atalhos para catálogo/perfis/oráculos/auditoria | A cópia completa preserva os caminhos do checker; índices temáticos podem apontar a seus arquivos. |
| `04experimentos/` | Planejamento de 12/10; cópia integral de `pilot-2026-10-13/`; pacote Google integral e ZIP associado | Tudo identificado como preparado/pausado. Não colocar a referência do avaliador no contexto do modelo. |
| `05resultados/` | Relatório geral, `reference-audit/`, `evidence/`, ZIP de resultados e recibos/verificações de entrega | Distinguir check jurídico, histórico meteorológico e entrega preparada; preservar logs originais. |
| `06ambiente/` | 12 arquivos leves de preflight, registro de checkout/TAR/bundle retidos na origem, limites de SDK/DGX | Não copiar checkout pesado, TAR, `.git`, ambientes, helper da Library ou credenciais. |
| `07apresentacoes/` | `APRESENTACAO-INE410159-2026-10-13.html`, índice para `docs/apresentacao.md` e roteiro curto | HTML estático existente; mostrar os mesmos estados do índice. |

Para evitar duplicação temática sem perder reprodução, o manifesto bibliográfico e os planos podem ser indexados em `02bibliografia`/`04experimentos` com links relativos à única cópia do protótipo em `03esquemas`. O pacote Google deve permanecer autônomo porque suas cópias internas fazem parte da entrega preparada.

Artefatos desta revisão: `inventory-review.md`, `task-inventory.json` (arquivos, hashes, duplicações e caminhos), `archive-comparison.json` (identidade dos ZIPs) e `inventory-summary.json` (estado/mapeamento compacto). Pendências científicas permanecem: revisão humana da referência, clarificação WT07, implementação jurídica e eventual decisão futura sobre execução; nenhuma delas autoriza reativação automática do piloto.
