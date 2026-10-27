# Resultados e evidências separados

## Jurídico

**Modelo jurídico Gemma: não executado, pausado.** [Estado e contagens](juridico-gemma/estado.json). A pasta jurídica não contém respostas de modelo, acurácia ou julgamentos novos. Templates originais estão no evaluator-only do CASE01; valores ausentes não significam acerto zero.

Os [checks documentais](checks-juridicos-2026-10-13/legal-package-check.json) passaram. Seis testes sintéticos do checker CASE01 passaram em sua preparação. Isso demonstra integridade e comportamento de software, sem certificar suporte dos pixels, semântica ou validade jurídica.

## Referência de Guilherme: meteorológica

[Relatório de referência](baseline-meteorologico-guilherme/RESULTADOS-REFERENCIA.md), [estatísticas completas](baseline-meteorologico-guilherme/statistics.stdout.txt), [métricas recomputadas](baseline-meteorologico-guilherme/recomputed-metrics.csv) e [inventário](baseline-meteorologico-guilherme/inventory-and-audit.json).

Fonte atribuída: [GuiT2002/comma2026-multimodal-argumentation](https://github.com/GuiT2002/comma2026-multimodal-argumentation), commit `d374ac21ca0645c4a49e8ad719a1845afe8754f7`. São 90 casos × 4 condições × 2 diretórios de modelos = 720 avaliações salvas. Recontagem: 657/720 presença lexical de predicados e 227/720 correspondência semântica arquivada. Não houve nova inferência ou novo julgamento semântico.

Claude arquivado tem cabeçalhos 4.6, apesar da configuração atual 5.5. Há 23 hashes PNG únicos globais, erro `cloudy(modany)` no gabarito temporal e proveniência do juiz não completamente registrada. Presença lexical não prova validade lógica. O clone completo permanece no caminho de origem fora do ZIP, como lacuna explicitada no índice.
