# LegalVision — argumentação jurídica visual

Pasta central de Ana para o trabalho com Guilherme. Organização em 13/10/2026 por cópias, com originais e versões preservados. **O piloto jurídico Gemma 4 está pausado e não foi executado.**

## Estado comprovado em 28/10/2026

- Dataset oficial desta estabilização: ADD01–ADD06.
- Seis tarefas, doze entradas preparadas e zero inferências.
- Referências com estado `assistant_proposed_pending_human_review`.
- Execução com estado `prepared_not_executed`.
- Relatório e pôster existentes são versões de trabalho, não entregas finais.
- Casos pendentes e a variante Qwen não integram este contrato.

O modo público reproduzível é ativado somente por `VITE_PUBLIC_DEMO=true` e compilado com `bun run build:public`. Ele abre o inventário diretamente, não inicializa Firebase, não chama APIs e oferece apenas `index.json`, `prepared-inputs.jsonl` e o notebook. O ZIP permanece no diretório de pesquisa do GitHub e não é servido pela aplicação pública.

Repositório para versionamento: [GitHub](https://github.com/anavvanzin/legalvision). Índice complementar: [Craft](https://docs.craft.do/editor/d/61378bc9-4fb2-b082-6573-17848e5fdf01/1e7d86d5-8bff-2ae6-bdbf-6bd7943e4969). O GitLab não foi alterado.

Comece pelo [mapa do projeto](00-indice/MAPA.md) e pelo [estado atual](00-indice/STATUS.md). Para apresentação, abra o [briefing atualizado](07-apresentacoes/BRIEFING.md). Para localizar o pacote preparado, consulte [experimentos](04-experimentos/README.md).

| Pasta | Conteúdo |
| --- | --- |
| [00-indice](00-indice/MAPA.md) | Índice, status, proveniência, manifestos e limites de backup |
| [01-contexto](01-contexto/README.md) | Registro da reunião de 8/10, HTML original e leitura textual sem scripts |
| [02-bibliografia-recursos](02-bibliografia-recursos/README.md) | Material didático, referências da auditoria, awesome-computer-vision e VIA |
| [03-esquemas](03-esquemas/README.md) | Dez esquemas auditados, seis conjuntos de correções, dois perfis e 16 oráculos propostos |
| [04-experimentos](04-experimentos/README.md) | CASE01 Gemma 4 preparado; model-input separado de evaluator-only; export original no arquivo local |
| [05-resultados](05-resultados/README.md) | Checks de software e baseline meteorológico histórico, atribuídos; resultados jurídicos ausentes |
| [06-ambiente](06-ambiente/README.md) | Preflight do Mac, logs, checker seguro e situação do projeto na interface Codex |
| [07-apresentacoes](07-apresentacoes/BRIEFING.md) | Briefing atual e apresentação; entregas anteriores preservadas como registros |

## O que existe

- Auditoria documental dos dez esquemas, com correções registradas em 3, 4, 6, 8, 9 e 10; dois perfis versão 0.1 e 16 oráculos. Eles não constituem dez esquemas executáveis ou 16 testes de um motor jurídico aprovado.
- Checks locais de integridade aprovados; seis testes sintéticos do checker CASE01 aprovados. Isso verifica software e contratos, não desempenho jurídico.
- Baseline de Guilherme: 90 casos meteorológicos/geotemporais × 4 condições × 2 diretórios de modelos, com 720 avaliações arquivadas. Recontagem: 657 presenças lexicais e 227 correspondências semânticas salvas. Não são resultados jurídicos novos.
- Pacote Gemma 4 com fotografia pública licenciada, prompts, regra hipotética, schema e templates vazios. Referência visual **assistida e provisória**, sem adjudicação humana.

## O que permanece pendente

Nenhuma resposta candidata de Gemma 4 ou rodada jurídica foi produzida. Erros de configuração/abertura do AI Studio pertencem a setup; não são métricas ou respostas de experimento. Templates vazios significam não executado, não taxa de acerto zero. DGX e publicação do GitLab privado não foram confirmadas. Cadastro desta pasta como projeto individual na barra lateral do Codex continua manual.

## Preservação e uso

A pasta documental original [legal-visual-argumentation](legal-visual-argumentation/README.md) está copiada. O bundle Git e os ZIPs de transporte permanecem no arquivo local e não são versionados nesta cópia. A cópia organizada em `03-esquemas` facilita consulta; duplicatas documentais idênticas não representam experimentos ou versões adicionais. As fontes de origem no Mac e os ZIPs anteriores não foram movidos ou apagados.

Não carregue esta pasta inteira ou o ZIP do projeto em um modelo. Quando houver autorização para retomar o piloto, somente os arquivos explicitamente permitidos em `04-experimentos/gemma4-case01/model-input` poderão compor a entrada. Gabarito, licença/fonte descritiva, registros e avaliações ficam em `evaluator-only`. A organização atual não retoma a execução.

A [política de versionamento](00-indice/VERSIONAMENTO-GITHUB.md) documenta exclusões e caminhos portáveis. Os dois HTMLs fornecidos foram lidos como dados. Os TXT derivados oferecem leitura sem executar seus scripts ou buscar recursos remotos. Links para serviços, artigos ou recursos externos são referências, não backups integrais; consulte [lacunas](00-indice/LACUNAS.md).

O repositório privado GitHub foi criado com autorização de Ana para receber a cópia revisada do projeto. A organização local e o versionamento não criam automaticamente um projeto na interface. Para a barra lateral, consulte [Codex](06-ambiente/CODEX-PROJETO.md).
