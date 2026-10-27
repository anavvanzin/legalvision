# Linha de base COMMA: resultados arquivados e conferência local

Auditoria de 13/10/2026 para o projeto INE410159. Fonte consultada somente em leitura: `https://github.com/GuiT2002/comma2026-multimodal-argumentation`, referência de Guilherme, remoto `GuiT2002/comma2026-multimodal-argumentation`. Não houve contato, push, chamada de API ou execução de `main.py`.

**Resultado apresentável:** existem 90 casos meteorológicos, saídas textuais de dois modelos em quatro configurações e 720 julgamentos binários arquivados. O dry-run documentado passou, e as contagens foram reproduzidas localmente. Esses resultados são uma linha de base geotemporal; não medem desempenho em casos jurídicos.

**Versão e origem dos arquivos.** HEAD local: `d374ac21ca0645c4a49e8ad719a1845afe8754f7`. Referências, resultados, arquivos de validação e scripts de avaliação foram adicionados no commit `637ca43c2420b73f409dd1478618942c7bcec13e`, de 07/10/2026. A data do commit comprova arquivamento, não a data da execução. O estado antes e depois foi somente `?? .DS_Store`; `git diff --exit-code` terminou com código 0. Um manifesto registra SHA-256 de 135 arquivos pertinentes.

**Entrada e método.** Cada registro TSV contém entimema e contexto, associado a um PNG por índice. As quatro configurações são: imagem + contexto (`col1`), entimema + imagem (`col2`), entimema + contexto (`col3`) e as três entradas (`col4`). As referências estão em `expected_outputs/`; saídas, em `results/`; julgamentos, em `validation/`.

| Classe | Casos / referências / PNGs | Hashes PNG únicos na classe | Avaliações: 2 modelos × 4 configurações |
|---|---:|---:|---:|
| Geográfica, `class1` | 64 / 64 / 64 | 17 | 512 |
| Temporal, `class2` | 15 / 15 / 15 | 6 | 120 |
| Geográfica + temporal, `class3` | 11 / 11 / 11 | 3 | 88 |
| Total | 90 / 90 / 90 | **23 globalmente**, com reuso entre classes | 720 |

Cada modelo tem 360 avaliações, cada configuração tem 180, e cada par modelo/configuração tem 90. Os 720 registros não são casos independentes. A classe geográfica representa 64/90 = 71,11% dos casos e domina a média microagregada.

**O que as métricas significam.** `scheme_correct` é presença lexical de `position_to_know`, `asserts` e `contain` após normalização. Não verifica aridade, ligação dos termos, premissas visuais, inferência ou validade lógica. `semantic_match` é um julgamento salvo da correspondência entre conclusões. O código prevê juiz `deepseek-v4-pro`, com prompt permissivo para sinônimos e detalhes omitidos; os CSVs não registram versão retornada do juiz, data, hash do prompt ou resposta bruta. A origem humana ou automática dos julgamentos e das referências não pode ser comprovada pelos arquivos locais. Nenhuma conclusão foi julgada novamente nesta auditoria.

| Identificação no arquivo de saída | Avaliações | Presença dos predicados | Correspondência semântica arquivada |
|---|---:|---:|---:|
| Claude `claude-sonnet-4-6` | 360 | 356/360 — 98,89% | 124/360 — 34,44% |
| `deepseek-flash` | 360 | 301/360 — 83,61% | 103/360 — 28,61% |
| Total | 720 | 657/720 — 91,25% | 227/720 — 31,53% |

O identificador Claude provém dos cabeçalhos dos resultados, não da configuração atual. `main.py` e README configuram `claude-sonnet-5-5`; não se devem atribuir os números arquivados ao 5.5. Não há saídas OpenAI nessa versão local.

| Entrada | Avaliações | Presença dos predicados | Correspondência semântica arquivada |
|---|---:|---:|---:|
| Imagem + contexto | 180 | 164/180 — 91,11% | 85/180 — 47,22% |
| Entimema + imagem | 180 | 174/180 — 96,67% | 40/180 — 22,22% |
| Entimema + contexto | 180 | 140/180 — 77,78% | 2/180 — 1,11% |
| Entimema + imagem + contexto | 180 | 179/180 — 99,44% | 100/180 — 55,56% |

Com todas as entradas, os julgamentos semânticos positivos são 53/90 para Claude e 47/90 para DeepSeek. Sem imagem, são 2/90 e 0/90. Essa diferença é descritiva do arquivo: o prompt sem imagem também usa redação específica; não há demonstração de generalização jurídica ou intervalo de incerteza. A distribuição conjunta é 227 `yes/yes`, 430 `yes/no`, 0 `no/yes` e 63 `no/no`.

**Conferência de software executada hoje.** Scripts da fonte foram executados a partir do workspace da tarefa, com ambiente mínimo e `PYTHONDONTWRITEBYTECODE=1`. O ramo `--dry-run` retorna antes da importação do SDK e das chamadas externas; `statistics.py` usa apenas a biblioteca padrão. Resultados e logs foram escritos exclusivamente em `task-2/reference-audit`.

| Verificação | Resultado | Alcance |
|---|---|---|
| `validation.py --dry-run` | exit 0: 24 arquivos, 720 avaliações, 0 pendentes | Estrutura, ordem/imagens e compatibilidade de pares e julgamentos lexicais salvos |
| `statistics.py` | exit 0; contagens acima | Leitura de julgamentos binários e agregação |
| Recontagem independente com stdlib | 0 divergências entre o critério lexical atual e os 720 rótulos de esquema | Confere a contagem; não reavalia semântica |
| TSV × metadados TXT | 179/180 registros de saída com os dois campos iguais; 1 registro legado | DeepSeek `class1`, caso 1, une entimema/contexto e tem 7 campos; o validador aceita por regra explícita |

O sucesso do dry-run é validação de software e arquivos, não evidência de que as conclusões estejam corretas. Não foi encontrada suíte de testes unitários neste repositório; `tests/` contém o corpus TSV, e os PNGs chamados `testN.png` são entradas de casos.

**Limitações observáveis.** Há somente 23 hashes de PNG únicos globalmente para 90 casos; repetição e dependência entre exemplos limitam inferências estatísticas. A autoria e revisão das referências não estão documentadas. Existe inconsistência literal em `expected_outputs/class2.txt`, linha 5: premissas `cloudy(monday)` e conclusão `cloudy(modany)`. O dry-run não detecta esse erro semântico. Alterar o juiz ou o prompt não invalida automaticamente julgamentos salvos. A única linha de saída legada aceita pelo validador não preserva separadamente os dois campos de entrada. Esses pontos foram registrados; nenhuma fonte foi corrigida.

**Menor entrega verificável hoje.** Repetir a conferência e a recontagem abaixo, apresentar a linha de base arquivada e registrar as limitações. Uma adaptação jurídica exige um conjunto próprio de casos, premissas visuais rastreáveis, referências revisadas e verificação formal além da presença de predicados; isso permanece uma proposta, não resultado já obtido neste repositório. O recorte jurídico não precisa ser STF.

```sh
python3 https://github.com/GuiT2002/comma2026-multimodal-argumentation/blob/d374ac21ca0645c4a49e8ad719a1845afe8754f7/validation.py --dry-run
python3 https://github.com/GuiT2002/comma2026-multimodal-argumentation/blob/d374ac21ca0645c4a49e8ad719a1845afe8754f7/statistics.py
python3 independent_audit.py \
  --repo https://github.com/GuiT2002/comma2026-multimodal-argumentation \
  --output local-workspace:preparation/reference-audit
```

**Evidências entregues:** [log do dry-run](validation-dry-run.stdout.txt), [estatísticas completas](statistics.stdout.txt), [comandos e códigos de saída](documented-checks.json), [inventário e auditoria estruturada](inventory-and-audit.json), [métricas recontadas](recomputed-metrics.csv), [hashes das fontes](source-sha256.csv) e [script independente](independent_audit.py).
