## Validação adicional e adjudicação

Veja [VALIDACAO-PREPARACAO.md](VALIDACAO-PREPARACAO.md) para evidências, falhas reproduzidas e limites de prontidão. O [protocolo humano](evaluator-only/adjudicacao/README.md) inclui ficha independente e registro de fontes/decisões ainda vazios. Não há adjudicação ou inferência nova.

O notebook de pesquisa agora valida a pasta neutra completa e permite selecionar caso/condição em `stimulus`, com bytes apenas em `with_image`. O notebook de `public/` confere somente os registros textuais disponíveis: não inclui pixels e não substitui o de pesquisa na prática visual. Não disponibilize `evaluator-only` ao candidato.

# Integração no legalvision — 27/10/2026

Este diretório é uma cópia adicional do pacote preparado anteriormente, integrada ao repositório em uma branch local. Os originais permanecem preservados. O lote continua com seis tarefas e doze entradas; não foram inventados casos para aumentar a contagem nem executados modelos.

`validar_entradas.py` verifica o inventário exato, os campos dos casos/índice/registros, imagens e hashes, composição canônica dos prompts e os controles sem anexo. `verificar_pacote.py` acrescenta conferência das referências, composição do notebook, ZIP e manifesto exaustivo com tamanhos e SHA-256. Execute com Python >= 3.9, biblioteca padrão, a partir de qualquer pasta: os caminhos são resolvidos pela localização dos scripts.

O catálogo da aplicação é `src/data/datasetCatalog.json`, na raiz do repositório. Somente três artefatos neutros são espelhados em `public/dataset-offline-2026-10-27`: índice, JSONL e notebook. As referências e o ZIP permanecem fora da pasta pública. O contrato oficial contém somente ADD01–ADD06.

**Limite de distribuição:** os arquivos brasileiros permanecem no repositório por decisão do projeto, sem atribuição de licença aberta. O Space não oferece o ZIP nem os recortes como downloads separados.

O relatório e o pôster em `entrega-academica` documentam a etapa anterior de preparação e continuam como versões de trabalho. Não são resultados de avaliação de modelos.

---

# Exemplos jurídicos visuais para notebooks — continuação de 27/10/2026

**Seis tarefas, doze entradas preparadas, nenhuma inferência de modelo realizada nesta continuação.** Esta é uma cópia de trabalho isolada do aditivo iniciado na conversa `01a17d40-9556-7761-a630-6886f2ced036`. A pasta original, seus notebooks, casos, runners e resultados foram preservados. Os hashes da cópia recebida estão em `PROVENIENCIA-CONTINUACAO.json`.

| ID | Tarefa | Evidência preparada |
| --- | --- | --- |
| ADD01 | Distinguir alternativas de comando impressas de uma opção selecionada | AO88B, página 1; duas caixas vazias |
| ADD02 | Relacionar uma seta ao respectivo painel | Placa britânica com dois painéis; a seta pertence ao inferior |
| ADD03 | Comparar período e permanência com cenário estipulado | Placa britânica; separar permanência e intervalo de não retorno |
| ADD04 | Identificar uma diagonal sobre a letra E | Recorte neutro do manual brasileiro de 2007, página PDF 142 |
| ADD05 | Identificar duas diagonais cruzadas sobre a letra E | Recorte neutro do mesmo manual, página PDF 152 |
| ADD06 | Distinguir alternativas impressas de um registro de cumprimento preenchido | AO88B, página 2; duas caixas vazias |

São três famílias documentais, quatro arquivos-fonte originais e seis imagens. Casos que compartilham documento ou capítulo não são amostras independentes. As referências, transcrições e regiões foram propostas e reconferidas por assistentes; **não foram adjudicadas por humanos**.

## Uso local

1. Mantenha `notebook-aditivo-offline.ipynb` ao lado da pasta `model-input` e abra o notebook em um ambiente Python. Ele apenas lê os dados, verifica imagens/hashes, prepara entradas em memória e permite visualizar um estímulo. Não instala pacotes, baixa fontes ou chama modelos.
2. As entradas já estão em `model-input/prepared-inputs.jsonl`, com status `prepared_not_executed`. Existem duas condições por caso, uma única preparação por condição e nenhuma resposta candidata incluída.
3. `somente-model-input.zip` contém exclusivamente a pasta neutra. Fontes, respostas esperadas e caixas não estão nesse ZIP. Preparar o arquivo não autoriza upload ou execução.
4. Execute `python3 -B verificar_pacote.py` para repetir as verificações locais de dados, hashes, contratos, células de preparação e conteúdo do ZIP. O teste não faz chamadas de rede ou modelo.

`with_image` e `without_image` recebem **texto idêntico**. A diferença preparada é somente a presença dos bytes/caminho/hash da imagem. Uma execução futura precisa usar chamadas independentes, sem histórico visual compartilhado, registrar a entrada efetiva e ser autorizada separadamente. Retirar o anexo depois de mostrá-lo na mesma conversa não produz um controle sem imagem.

## Continuação e compatibilidade

As propostas brasileiras foram completadas com o [PDF oficial do Ministério dos Transportes](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/manual_vol_i_2.pdf/@@display-file/file). A tentativa anterior no servidor Seara não foi repetida. O PDF e suas páginas completas ficam apenas na avaliação; os candidatos recebem recortes quadrados do mesmo tamanho, sem títulos, códigos ou descrições. O arquivo é a 2ª edição de 2007: o exercício não afirma direito vigente.

Na cópia, a regra ADD03 perdeu um exemplo de conversão horária que coincidia com a inscrição-alvo. Caminhos de `source_file` e `model_image` nas referências agora são relativos à raiz deste pacote. O símbolo formal da letra brasileira usa `letter_e`, em minúsculas. A função de composição herdada do notebook foi reaproveitada para manter o texto igual entre condições.

Este pacote **não é substituição direta** para `legal-grounding/cases.json`. O adaptador anterior fixa outra tarefa e vocabulário; o avaliador usa outras chaves, condições e uma restrição de página 1, incompatível com a página 2 de ADD06 e as páginas do manual. Em ADD03, a leitura de não retorno é um fato suplementar, não premissa necessária da comparação de permanência. Não converter automaticamente todas as anotações em premissas indispensáveis nem combinar denominadores com avaliações meteorológicas históricas.

## Fontes, direitos e limites

- AO88B: [District of Wyoming, formulário oficial, revisão 02/14](https://www.wyd.uscourts.gov/sites/wyd/files/forms/AO_088b.pdf). O texto histórico de Rule 45 anexo não é utilizado como norma atual.
- Placas britânicas: [Department for Transport, capítulo oficial](https://www.gov.uk/government/publications/know-your-traffic-signs/on-street-parking-control-signs-and-road-markings). Atribuição e declaração OGL v3.0 da publicação estão nas referências. A página separada dos termos não foi obtida na verificação anterior.
- Brasil: [manual de 2007, Ministério dos Transportes](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/manual_vol_i_2.pdf). Acesso público foi confirmado. Não foi identificada autorização específica de redistribuição pública dos recortes; esta preparação é local e não atribui licença aberta ao manual.

As regras são convenções operacionais fornecidas no exercício. As imagens não provam infração, culpa, identidade, intenção, validade jurídica ou causalidade. Reconhecimento de uma imagem pública a partir de treinamento anterior continua possível; o controle sem imagem não resolve sozinho essa questão.

As duas referências brasileiras inicialmente bloqueadas foram preservadas em `evaluator-only/historico-origem`. Dois SVGs vazios herdados de tentativas antigas também foram preservados e estão marcados como fontes inválidas; os SVGs válidos terminam em `.original.svg`. Eles não entram na pasta neutra.

## Entrega acadêmica informada

O pedido foi ampliado para relatório PDF de 10 a 20 páginas e pôster PDF, com links para dataset, código, apresentação no Google Apresentações e vídeo no YouTube. Prazo informado: **5 de janeiro de 2027, 04:24**, no horário apresentado pela usuária. Os PDFs desta continuação documentam o estado verificado, sem fabricar resultados de modelos. Links ainda não fornecidos devem permanecer identificados como pendentes antes da submissão.
