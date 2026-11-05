# Adjudicação humana — protocolo proposto

**Estado: não realizada.** Nenhum revisor foi designado, contactado ou representado por um assistente. Os seis `*.reference.json` continuam `assistant_proposed_pending_human_review`. Campos `null` e `pending` não são avaliações nem concordância.

## Procedimento

1. Congele o commit e o manifesto do pacote. Cada revisor humano recebe separadamente somente `model-input`, o notebook neutro e uma cópia de `ficha-cega.template.json`. Não forneça este diretório completo: o registro de fontes e as referências revelam as respostas propostas. Registre identidade/pseudônimo, data UTC e exposição prévia; exposição não pode ser desfeita ou declarada cega retroativamente.
2. Dois revisores anotam independentemente os pixels, sem respostas de modelos, fontes descritivas ou referências assistidas. Para cada fato: átomo, região XYXY normalizada no PNG candidato (origem superior esquerda), transcrição quando cabível, legibilidade e incerteza. Separem fatos visuais, cenário estipulado e conclusão pela regra operacional. Não usem a aparência para concluir validade jurídica, culpa, intenção ou ocorrência de um ato real.
3. Fechem e versionem as fichas antes de abrir `registro-fontes-decisoes.json`, o original e a referência proposta. Na segunda etapa, confiram URL, arquivo/hash, edição, página PDF versus impressa, transformação e correspondência com a imagem. Não é necessário baixar novamente as fontes para conferir os originais arquivados. Disponibilidade atual e condições de reutilização permanecem verificações distintas, sem parecer jurídico automático.
4. Comparem as duas fichas e a proposta assistida por fato, relação espacial, conclusão, região e ambiguidade. Registrem desacordos sem sobrescrever as fichas. Um adjudicador humano registra aceitar, revisar ou excluir, com motivo e evidência localizada. Caso precise de terceiro revisor, registrem a intervenção e sua exposição. Não aprovem por maioria automática ou porque os testes passaram.
5. Toda referência revisada deve preservar a anterior no histórico Git, apontar fichas e decisão, identificar responsável/data e receber novo hash. Somente após decisão humana documentada se pode alterar seu status. Refaçam manifesto e checks. Congelem referências e política de avaliação antes de examinar respostas candidatas.

## Critérios de aceitação

- **Legibilidade:** alvos visíveis na resolução candidata. Ausência de marca exige examinar a caixa inteira; ilegibilidade não equivale a caixa vazia. As regiões aproximadas devem cobrir o alvo e sua relação com rótulo/painel. Não há limiar de IoU aprovado neste piloto.
- **Regra e suficiência:** conclusão decorre apenas dos fatos observados, cenário estipulado e regra fornecida. Nenhum comando impresso prova preenchimento ou cumprimento. Fatos suplementares não se tornam premissas necessárias.
- **Contrato:** todos os átomos usados pertencem ao vocabulário. Resolver ambiguidades antes de pontuar. Proposta para aprovação humana: comparar conjuntos de premissas, conclusão e suporte separadamente; ordem ou espaços não constituem erro semântico. `expected_output` é uma serialização proposta, não um avaliador jurídico pronto. Não executar o avaliador legado como substituto.
- **Controle:** sem imagem exige `[],undetermined(visual_facts,doc1)` como cumprimento da instrução, e não prova de incapacidade visual. O prompt manda abster; não permite medir conhecimento prévio isoladamente. Prompts contêm alternativas e regras deliberadamente, sem fonte descritiva ou gabarito selecionado.
- **Fonte:** hash e página/edição compatíveis, transformação rastreável, nenhuma síntese ou sobreposição. Regiões referem-se ao PNG, não à página completa. ADD04/05: recortes na renderização escala 4; prévias arquivadas em escala 2.
- **Decisão:** aceitar somente com registro humano e justificativa; revisar quando há erro corrigível; excluir/suspender se o alvo ou o contrato não sustentam decisão inequívoca. Caso pendente não entra no denominador de uma avaliação homologada.

## Pontos por tarefa a revisar

| Caso | Critério específico (não substitui observação independente) |
| --- | --- |
| ADD01 | Associar as duas caixas às alternativas de comando; distinguir impressão, marca e escolha. |
| ADD02 | Atribuir cada comando e seta ao painel; examinar o painel inteiro antes de declarar ausência; não transferir a seta entre painéis. |
| ADD03 | Ler dias, horário e limite; aplicar quarta-feira 10h/25 min. O intervalo de não retorno é suplementar: o cenário não tem retorno. Sua omissão não invalida sozinha uma conclusão devidamente sustentada. |
| ADD04 | Examinar letra parcialmente ocluída e número/relação das diagonais; aplicar só a convenção fornecida. |
| ADD05 | Mesmo critério, com atenção à oclusão maior; comparar com ADD04 somente depois da primeira anotação independente. |
| ADD06 | Associar caixas às alternativas de registro; vazio não prova que o serviço não ocorreu. |

## Rastreabilidade e limites

`registro-fontes-decisoes.json` fixa os hashes da referência, estímulo e original no início desta rodada. `ficha-cega.template.json` não inclui URLs, respostas ou nomes descritivos das fontes. Copie-a para cada revisor; preserve respostas e arquivos originais em `evaluator-only`. Não envie nenhum desses registros a candidatos, RAG ou ferramentas.

Famílias: AO88B (ADD01/06), capítulo britânico de estacionamento (ADD02/03; dois SVGs) e manual brasileiro (ADD04/05). Seis tarefas não são seis fontes independentes; há quatro arquivos originais válidos. Não faça divisão treino/teste por caso que separe membros da mesma família; este conjunto não sustenta inferência populacional ou generalização jurídica.

Antes de uma rodada autorizada: fixar modelo/versão, configuração, ordem aleatória registrada, seed quando aplicável, repetições, regra de falha/retentativa e política de avaliação. Cada condição usa chamada nova sem histórico compartilhado, ferramentas ou recuperação das referências. Registrar prompt efetivo, hash e bytes anexados, condição, identificador da chamada, resposta bruta ou erro original e tempos. Hash de estímulo ou notebook limpo não comprovam isolamento real do serviço. Sem inferências nesta validação, essa independência é apenas uma exigência do futuro executor.
