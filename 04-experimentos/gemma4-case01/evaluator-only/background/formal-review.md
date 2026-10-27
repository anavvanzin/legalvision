# Revisão formal local — INE410159

Data da revisão: 13/10/2026. Escopo: pacote `legal-visual-argumentation`, em leitura; nenhuma fonte do projeto alterada. Este parecer trata de especificação e integridade documental. Não produz avaliação de modelo multimodal nem validação jurídica.

**Resultado apresentável hoje:** existe uma auditoria dos dez esquemas, com seis conjuntos de correções registrados, um contrato de quatro eixos de avaliação, dois perfis operacionais propostos e dezesseis oráculos de aceitação. O verificador local de integridade é executável. Os perfis, o validador argumentativo e os casos empíricos ainda não estão implementados.

## Artefatos e versão comprovados

- Pasta principal: `repo-root:./legal-visual-argumentation`.
- Duplicata: `repo-root:. 2/legal-visual-argumentation`.
- As duas pastas têm **15 arquivos comuns de conteúdo e configuração idênticos**, incluindo `.gitignore`; as diferenças encontradas são somente arquivos `.DS_Store`. A comparação usou bytes e SHA-256, excluindo `.git`.
- As pastas soltas não contêm `.git`. Isso não significa ausência de histórico: existe `../legal-visual-argumentation.bundle`, com 23.525 bytes e SHA-256 `85bc89fc5c500f68a458de7ffa27b1a88e6f8f0b8207568ea3ab8a4c599f9452`.
- O coordenador restaurou esse bundle sem rede em `local-workspace:preparation/work/legal-package`. A revisão confirmou o commit `16919e55dd570387f67f83227a2d5cbf3639f8b8`, mensagem `docs: audit legal schemes and specify visual validation pilot`, data `2026-10-13T02:54:01+08:00`, e igualdade dos mesmos 15 arquivos com a pasta principal.
- O catálogo tem data `2026-10-12`; os perfis são versão `0.1`, com status `proposed_not_implemented`. Os dez itens do catálogo têm `executable: false`.

O manifesto contém três referências a PDFs, seus tamanhos e hashes, e o commit do projeto de Guilherme consultado em 12/10 (`d374ac21ca0645c4a49e8ad719a1845afe8754f7`). Os PDFs não são redistribuídos no pacote. Esta revisão não revalidou seu conteúdo nem consultou remotamente o GitLab ou o projeto de Guilherme. As afirmações de estado remoto no README são registros históricos, não consultas atuais.

Evidências: [README](../../../../legal-visual-argumentation/README.md:6), [catálogo](../../../../legal-visual-argumentation/schemes/catalog.json:2), [perfis](../../../../legal-visual-argumentation/schemes/profiles.json:2), [manifesto](../../../../legal-visual-argumentation/sources/manifest.json:1).

## O que a auditoria entrega

| Esquema | Resultado documentado | Pendência de execução |
|---|---|---|
| 1 — Analogia, v1 | Formulação preservada | Polaridade e similaridade juridicamente relevante |
| 2 — Analogia, v2 | Lacuna entre similaridade e relevância explicitada | Vincular similaridade à proposição transferida |
| 3 — Classificação verbal | Modalidade derrotável corrigida no texto; perfil proposto | Definição operacional da categoria, warrant e CQs |
| 4 — Regra estabelecida | Segunda CQ2 corrigida para CQ3 | Escopo de exceções e modalidade de obrigação |
| 5 — Caso excepcional | Formulação preservada, CQs condicionais anotadas | Vínculo da evidência à regra/caso e política de CQs |
| 6 — Testemunho | Título/tabela completados; adaptação preservada; perfil proposto | Oportunidade específica de observação e cinco CQs separadas |
| 7 — Ad Populum | Formulação preservada | Domínio, quantificação universal e confirmação bibliográfica |
| 8 — Contraexemplo | Direção PC2 > PC1 esclarecida no texto | Contexto do caso atual, partes e comparação operacional |
| 9 — Preferência de precedente | Contraexemplo passou de premissa positiva a exceção; conclusão favorece P | Semântica de exceção existencial e busca em conjunto especificado |
| 10 — Comparação de fatores | Grafia `defendant` corrigida | Vincular caso/questão e definir termos de parte |

Isso resume o registro local, sem atribuir aprovação jurídica ou equivalência executável às formulações. Os seis conjuntos de correções são 3, 4, 6, 8, 9 e 10. A escolha de 3 e 6 para o piloto permanece uma proposta. Evidências: [auditoria](../../../../legal-visual-argumentation/docs/auditoria.md:16) e [registro de correções](../../../../legal-visual-argumentation/docs/correcoes.md:3).

## Verificação executável e alcance real

Comando documentado: `python3 scripts/check_package.py`. O coordenador informou execução atual na cópia restaurada com **exit 0**. Esta revisão confirmou que o script da cópia tem o mesmo conteúdo da fonte e examinou todas as suas verificações; não repetiu a execução.

O script verifica:

1. Numeração 1–10 e unicidade dos IDs do catálogo.
2. Correspondência entre esquemas marcados para o piloto e IDs dos perfis.
3. IDs distintos de CQs e quantidades de duas CQs na classificação e cinco no testemunho.
4. IDs distintos dos casos, referências aos perfis, quatro campos esperados e valores permitidos.
5. Presença de exemplos rotulados `pass`/`fail` e `supported`/`contradicted`/`insufficient` em cada perfil.
6. Duas linhas discriminantes da tabela booleana de quatro combinações para `D ∧ E` e `D ∧ ¬E`.
7. Presença de três textos de correção em `notion-edits.json`.

O script **não calcula a saída de nenhum dos dezesseis cenários**. Não verifica aridades e tipos dos átomos, vinculação de A/C/F ou W/S, polaridade do candidato, fontes reais, imagens, evidência, resposta individual de CQ, implementação da política argumentativa ou validade jurídica. Também não fixa explicitamente a cardinalidade dos casos em 16: a saída imprime a quantidade encontrada. A menção a uma resposta independente do Wolfram na linha 45 é texto fixo; rodar o script hoje não faz uma nova consulta ao Wolfram.

Evidência: [script completo](../../../../legal-visual-argumentation/scripts/check_package.py:9). A verificação de 12/10 já declara esse alcance limitado em [verificacao.md](../../../../legal-visual-argumentation/docs/verificacao.md:7).

Os dezesseis registros são **7 oráculos de classificação e 9 de testemunho**, cada um com cenário textual e resultado esperado. Não contêm instâncias completas com átomos candidatos, imagem/hash/região, fontes, revisores e estados de CQs. A distribuição abaixo é uma contagem da especificação, nunca uma taxa de acerto:

| Eixo | Contagem de rótulos esperados |
|---|---|
| Estrutura | 9 `pass`, 7 `fail` |
| Semântica | 4 `match`, 11 `mismatch`, 1 `unreviewed` |
| Evidência visual | 8 `supported`, 3 `contradicted`, 5 `insufficient` |
| Aceitabilidade | 2 `provisionally_supported`, 3 `defeated`, 11 `unresolved` |

Evidência: [nota dos casos](../../../../legal-visual-argumentation/tests/acceptance-cases.json:2). A ausência dos dados para execução deve ser comparada com o [contrato de instância](../../../../legal-visual-argumentation/docs/validacao.md:15).

## Pendências substantivas para estabilizar os oráculos

**1. WT07 mistura duas decisões.** O caso espera `structure=fail` e `argument_status=defeated` quando a oportunidade é refutada e o candidato conclui `¬S`. A política diz que falha estrutural impede construir argumento. A derrota do argumento original para S é uma decisão diferente da rejeição estrutural da conclusão candidata `¬S`. É preciso explicitar o alvo e a precedência dessas decisões antes de usar WT07 como teste automático. Nenhum resultado atual resolve essa divergência.

Evidências: [WT07](../../../../legal-visual-argumentation/tests/acceptance-cases.json:163), [política](../../../../legal-visual-argumentation/docs/validacao.md:71) e [proibição de inverter S](../../../../legal-visual-argumentation/docs/validacao.md:67).

**2. Estrutura e proveniência precisam de uma fronteira explícita.** VC04, WT03 e WT08 recebem falha estrutural por norma, sinceridade ou depoimento inventados. Isso pode ser consistente se o contrato estrutural inclui fonte obrigatória/tipo permitido; a nota inicial dos casos, porém, descreve estrutura como forma/vinculação e separa suporte externo. Distinguir fonte obrigatória ausente, tipo de fonte proibido e afirmação bem formada sem suporte evita que o mesmo erro mude de eixo entre implementações.

Evidências: [VC04](../../../../legal-visual-argumentation/tests/acceptance-cases.json:43), [WT03](../../../../legal-visual-argumentation/tests/acceptance-cases.json:115), [WT08](../../../../legal-visual-argumentation/tests/acceptance-cases.json:175) e campos `allowed_source` dos perfis.

**3. Cobertura de CQs é declarada, não demonstrada.** WT06 refere-se a “uma CQ obrigatória” desconhecida sem identificar qual. O script conta as cinco CQs, mas não testa cada uma, suas justificativas de não aplicabilidade ou a presença de derrotador. Para classificação, também faltam casos dedicados a CQ desconhecida e CQ com derrotador estabelecido. Número de CQs não equivale a cobertura comportamental.

Evidências: [WT06](../../../../legal-visual-argumentation/tests/acceptance-cases.json:151), [cinco CQs](../../../../legal-visual-argumentation/schemes/profiles.json:144), [checagem de quantidade](../../../../legal-visual-argumentation/scripts/check_package.py:20).

## Menor resultado verificável hoje e sequência seguinte

O resultado disponível para apresentar hoje é a **reprodução do teste de integridade documental e da diferença de polaridade de exceção**, com versão, hashes, comando e saída. Isso sustenta a existência e a rastreabilidade da contribuição formal. Não sustenta desempenho visual ou execução dos oráculos.

O próximo experimento local de software, ainda não executado, é preencher entradas formais completas para VC01/VC03 e WT01/WT07, esclarecer WT07 e implementar apenas a validação de vinculação e a política definida. Deve receber anotações externas estipuladas; resultados continuariam sendo testes de contrato, sem métrica de modelo. Para chegar à avaliação multimodal, ainda são necessários cenas e direitos de uso, dupla anotação/adjudicação, prompts/ablação, versão e parâmetros do modelo, saídas integrais e análise por premissa.

O plano local confirma que parser, estrutura, relatório e etapa empírica estão todos pendentes: [plano](../../../../legal-visual-argumentation/docs/superpowers/plans/2026-10-12-piloto.md:22).

## Registro de evidência e limites desta revisão

Foram lidos README, auditoria, contrato, correções, verificação, desenho/plano, três JSONs centrais, manifesto e script. Foram comparadas as cópias por SHA-256/bytes; foram conferidos bundle e commit da restauração local. Não houve alteração dos projetos revisados nem execução externa. O resultado do checker foi fornecido pelo coordenador; as conclusões sobre seu alcance vêm da leitura direta do código.

Skill aplicada: [verification-before-completion](local-source:omitted-host-path). Instruções locais lidas em `local-source:omitted-host-path`; não existe `.agents/skills` nas duas pastas alvo. A única skill do workspace, `composio`, trata de integrações externas e não foi aplicada a esta revisão local.

Confiança: forte para inventário, igualdade de conteúdo e escopo do script; limitada à especificação para consistência argumentativa. A revisão não confirma literatura primária, domínio jurídico, suporte visual, desempenho ou estado remoto. O próximo critério de maior valor é resolver a política de WT07 e fornecer fixtures formais completas; a auditoria de leitura está concluída, a implementação permanece pendente.
