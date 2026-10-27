# Experimentos preparados - piloto pausado

**Nenhuma condição candidata de Gemma 4 foi executada. A organização não retoma o piloto.**

O [CASE01](gemma4-case01/COMECE-AQUI.md) usa fotografia pública licenciada, categoria observacional e regra hipotética. O [plano](gemma4-case01/execution-plan.json) tem duas condições futuras, imagem+texto e texto apenas. A referência é assistida e provisória.

| Diretório | Uso |
| --- | --- |
| [model-input](gemma4-case01/model-input/system.txt) | Estímulo neutro, prompts, schema, perfil e regra fornecida; sem gabarito |
| [evaluator-only](gemma4-case01/evaluator-only/EVALUATION.md) | Fonte/licença, referência, checks, fixtures, registros e avaliações; nunca carregar no candidato |
| [templates de resultados](gemma4-case01/evaluator-only/results/run-record.template.json) | Campos futuros; zero resultados |
| Export original local | ZIP de 623 KB preservado fora do Git; hash no registro de proveniência |

A cópia organizada acrescenta alvos documentais de links de background, mantendo os bytes de model-input. Isso é ajuste de organização, não mudança de estímulo/protocolo nem experimento. O manifesto desta cópia foi atualizado; o ZIP anterior ficou intocado.

Não carregar o ZIP central ou a pasta evaluator-only no Google. O guia manual permanece para futura autorização. Erros AI Studio pertencem a configuração, não ao CSV de resultados experimentais. Não existe importador de workflow universal ou deploy neste projeto.
