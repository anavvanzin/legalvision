# Validação da preparação experimental — LegalVision

Base inspecionada: PR #1, commit `e8624d1cb4a9780bcce4ad2258c81a51e1e19bdb`. Esta rodada executou verificações locais e inspeção por assistente; **zero inferências de candidatos, zero adjudicações humanas**. Não acessou DGX nem AI Studio e não chamou APIs de modelos.

## Prontidão

| Camada | Estado e limite |
| --- | --- |
| Arquivos e entradas | Seis tarefas ADD01–ADD06, doze registros `prepared_not_executed`; imagens/fontes com SHA-256, arquivo neutro comparado byte a byte e manifesto exaustivo. |
| Fronteira candidato/avaliação | Inventário exato do diretório neutro; campos de referência extras são rejeitados. Referências, originais, fichas humanas e resultados ficam em `evaluator-only`. Não garante detecção semântica de qualquer vazamento futuro inserido em um campo textual permitido. |
| Condições preparadas | Prompt idêntico byte a byte por caso. Só caminho/hash/anexo variam; `without_image` tem ambos os campos de anexo nulos. |
| Notebook de pesquisa | Preparação e seleção efetiva de estímulos testadas localmente para as duas condições; sem APIs. Preview opcional com IPython. Células salvas sem outputs ou contadores de execução. |
| Notebook público | Confere consistência textual dos três downloads; não tem imagens/casos e não comprova seus hashes nem composição canônica. Insuficiente para uma prática com pixels por si só. |
| Referências e avaliação | Seis propostas assistidas pendentes. Protocolo, ficha cega e registro de fontes prontos para preenchimento humano; nenhum avaliador deste contrato implementado ou homologado nesta rodada. |
| Execução de candidatos | Não realizada. Independência real de sessões e aderência do payload só poderão ser verificadas no executor autorizado. |
| Artefatos acadêmicos | Relatório de 14 páginas e pôster A1 de uma página preservados, sem regeneração. Continuam versões de trabalho, sem resultados novos. |

## Falhas reproduzidas e corrigidas

Os verificadores originais passaram no pacote recebido (3 grupos de checks; 14 testes de integração/evidência). Os testes de regressão novos reproduziram cinco falhas antes da correção:

- O notebook de pesquisa aceitava campo extra de referência num caso e continuava com cinco arquivos de caso quando o sexto estava ausente. Agora usa uma cópia standalone do validador completo, conferida contra os registros canônicos. O contrato do índice foi fixado explicitamente em ADD01–ADD06.
- O notebook público aceitava par caso/condição duplicado, texto diferente entre condições e anexo no controle. Agora verifica os pares únicos completos, campos, texto e declarações de anexo. Isso certifica consistência dos arquivos disponíveis, não autenticidade de pixels ausentes.

A seleção do notebook de pesquisa passa a produzir `stimulus['prompt']` e `stimulus['image_bytes']`, nulo no controle. A visualização respeita a seleção. Em Python sem IPython, a preparação funciona e informa a indisponibilidade da prévia; no Jupyter ela usa a capacidade de exibição já instalada. Nenhuma instalação ou execução remota foi necessária.

Correção de proveniência sem alterar pixels: as prévias de ADD04/05 em `source-pages` têm 1191×1684 pixels (escala 2). As coordenadas do recorte pertencem à renderização 2382×3368 (escala 4). Ambos os recortes são 360×360. As referências agora distinguem explicitamente esses espaços. Renderizações locais com PDFium reproduziram os pixels de ambos os recortes a partir do PDF arquivado em escala 4 e os das prévias em escala 2. Não se exige identidade do container PNG entre renderizadores.

## Contratos examinados

| Tarefa | Suficiência a adjudicar e limites |
| --- | --- |
| ADD01 | Estados das caixas production/inspection sustentam escolha ou indeterminação documental. Não demonstram emissão ou cumprimento de ordem. |
| ADD02 | Comandos e seta precisam ser associados ao painel; ausência de seta requer inspecionar o painel completo. A conclusão trata apenas de abrangência espacial na convenção fornecida. |
| ADD03 | Dias, horário e limite sustentam a comparação com o cenário estipulado. O não retorno é fato suplementar: não há evento de retorno no cenário. Não exigir esse átomo como premissa indispensável nem somar os dois intervalos. |
| ADD04 | Letra e diagonal simples são alvos visuais propostos, parcialmente ocluídos; categoria depende da regra hipotética. |
| ADD05 | Letra e diagonais cruzadas, com maior oclusão; não tomar identificação prévia da placa como prova de leitura dos pixels. |
| ADD06 | Caixas e alternativas indicam o estado do registro, sem provar ocorrência ou ausência de serviço no mundo. |

Os contratos incluem alternativas de resposta deliberadamente. Não encontrei gabarito selecionado ou URL descritiva no diretório neutro atual. Inspeção visual por assistente é apoio à auditoria e não validação humana independente. Os PNGs AO/britânicos contêm metadados técnicos de cor/dimensão, sem descrição de fonte ou resposta identificada; os dois recortes brasileiros não têm metadados Pillow adicionais. Nenhum estímulo foi alterado.

A abstenção sem imagem é explicitamente instruída. Uma futura taxa de abstenção mede cumprimento desse controle, não demonstra por si só necessidade causal da imagem, incapacidade visual ou ausência de memorização. Sem variantes contrafactuais e protocolo próprio, não atribuir generalização ou causalidade aos seis casos.

`expected_output` permanece uma serialização proposta de referência. Ordem das premissas, fatos suplementares, conclusões, abstenções e erros de formato precisam de política aprovada antes da pontuação. O verificador de pacote checa consistência dessa serialização; não pontua candidatos. O runner legado fixa outra tarefa/página e não é compatível diretamente.

## Repetição local

Na raiz do repositório, Python >= 3.9:

```sh
python3 -B 04-experimentos/dataset-piloto-2026-10-27/validar_entradas.py
python3 -B 04-experimentos/dataset-piloto-2026-10-27/verificar_pacote.py
python3 -B -m unittest discover -s tests -p 'test_*.py' -v
```

Resultado desta rodada: 3 grupos de checks do pacote e 20 testes Python aprovados. Inclui adulterações de inventário, campo de referência extra, imagem/hash, prompts, pares e controle, além da seleção com/sem bytes. Os testes executam as células Python diretamente; não comprovam interface Jupyter, kernel do DGX, desempenho de modelo ou renderização no navegador. O manifesto foi regenerado para registrar os novos textos/códigos e a proveniência corrigida; o ZIP neutro não precisou mudar.

## Uso na prática e próximos gates

Para a prática, copie **somente** `model-input/` e o notebook de pesquisa para o mesmo diretório, abra num kernel Python >= 3.9 e execute as células em ordem. Ajuste `INPUTS` se necessário; selecione caso e condição na última célula. Os arquivos `somente-model-input.zip` oferecem a pasta neutra, mas não o notebook, que deve ser copiado à parte. Não monte o repositório completo em ferramentas de um candidato. A prévia vista por um humano não autoriza compartilhar a conversa/imagem entre chamadas de modelos.

A preparação offline está pronta. Acesso DGX, kernel e execução Jupyter remota permanecem não verificados. Antes de medir desempenho: concluir a [adjudicação humana](evaluator-only/adjudicacao/README.md), congelar referências e política de avaliação, configurar executor isolado deste contrato e obter autorização para a rodada e eventuais custos. Preservar respostas brutas, erros e parâmetros; não corrigir candidatos silenciosamente. Nenhuma execução paga está autorizada por este documento.

Manter agrupadas as famílias AO88B, capítulo britânico e manual brasileiro: seis tarefas, quatro arquivos originais válidos, três famílias documentais. Não tratar pares da mesma família como observações independentes, nem combinar denominadores com o baseline meteorológico. Condições de redistribuição dos recortes brasileiros e demais pendências da entrega acadêmica continuam abertas.
