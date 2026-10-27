# Contrato de validação proposto
Versão 0.1, sujeita à discussão do grupo. Este documento especifica comportamento; não descreve software já implementado.

## Quatro saídas, sem nota agregada
| Eixo | Resultado | Como decidir |
|---|---|---|
| Estrutura | pass / fail | Parser e contratos por esquema; grafo tipado e argumentos ligados |
| Semântica | match / mismatch / unreviewed | Comparação de cada premissa e conclusão com anotação humana adjudicada |
| Evidência visual | supported / contradicted / insufficient / not_applicable | Proveniência verificável e revisão da região/instante |
| CQs e aceitabilidade | provisionally_supported / defeated / unresolved | Política explícita, por instância, sem converter desconhecido em falso |

“Pass” estrutural pode coexistir com “mismatch” semântico, “insufficient” visual e “unresolved” argumentativo. A decisão jurídica continua fora deste escopo.

## Representação
Cada instância tem `case_id`, `scheme_id`, versão do perfil, jurisdição/contexto (ou indicação de cenário fictício), proposição em discussão e IDs das fontes.
Cada premissa registra:
- átomo tipado: predicado, lista ordenada de argumentos, polaridade;
- papel: premissa ordinária, pressuposto, exceção ou conclusão;
- proveniência: imagem, texto, regra fornecida ou hipótese explicitamente marcada;
- evidência: ID/hash da fonte, região normalizada [x0,y0,x1,y1] quando imagem, frame/tempo quando vídeo, trecho quando texto;
- avaliação: suporte, contradição ou insuficiência, com justificativa e ID do revisor.

Confiança numérica do modelo é metadado; não substitui suporte. IDs e coordenadas corretos mostram rastreabilidade, não que a região realmente prova o átomo.

## 3 — Classificação verbal
Contrato proposto:
```text
classified_as(A,C)
classification_warrant(C,F)
---------------------------- defeasibly
has_property(A,F)
```
- A é o mesmo objeto em premissa e conclusão.
- C é a mesma categoria em ambas as premissas.
- F é a propriedade autorizada pelo warrant; trocar sujeito, categoria ou propriedade falha.
- `classification_warrant(C,F)` representa a generalização fornecida, não uma propriedade física do objeto C.
- Negação explícita é distinta de ausência. Não transformar “parece pertencer” em “definitivamente pertence”.
- CQ1: há dúvida fundamentada sobre F em A? CQ2: a classificação de A em C é fraca/contestável? Estes rótulos operacionalizam a tabela do Notion; não são transcrição de uma linguagem formal canônica.
- O warrant precisa de identificação, texto e versão. Se jurídico, registrar jurisdição, vigência e pressupostos; esses dados não podem ser inferidos da imagem.

**Permissão visual:** a imagem pode sustentar características observáveis e a classificação conforme definição operacional fornecida. Exemplo didático: classificar um objeto como “bicicleta” segundo critérios explicitados, depois aplicar uma regra fictícia. O modelo não deve inferir propriedade, autorização, culpa ou sanção por aparência.

**Abstenção:** se C depender de característica invisível (motor oculto, potência, propriedade do bem, autorização) ou houver oclusão relevante, retornar insuficiente. Ausência de imagem bloqueia uma premissa designada exclusivamente visual.

## 6 — Testemunho
Contrato proposto para teste, preservando a adaptação do Notion como fonte histórica:
```text
states(W,S)
position_to_observe(W,S,SCENE,TIME)
truthfulness_assumption(W,S)  [assumption, never inferred from face/image]
--------------------------------------------------------- defeasibly
S
```
`position_to_observe` é uma especialização operacional sugerida de `position_to_know`; não alegar equivalência em todo domínio. Se usada a versão genérica com D, exigir vínculo entre S e D.

- W é a mesma testemunha; S é a mesma proposição, inclusive polaridade, participantes, local e tempo.
- A fonte do depoimento deve ser texto/áudio documentado; imagem da cena não cria `states(W,S)`.
- Posição, linha de visada, oclusão, iluminação, distância e temporalidade precisam ser suficientes para a oportunidade específica de observação. Sem calibração, uma fotografia não mede altura/distância exatas.
- Sinceridade é pressuposto declarado/revisado; nenhuma detecção facial de honestidade.
- CQ1: coerência interna do relato.
- CQ2: coerência com evidência externa ao relato.
- CQ3: coerência com outros testemunhos independentes; derivação da mesma fonte não conta como independência.
- CQ4: evidência de viés pertinente ao relato.
- CQ5: plausibilidade da proposição nas circunstâncias.
- “Não aplicável” exige justificativa (por exemplo, não há outros depoimentos no caso para CQ3); não pode ser escolhido automaticamente.

**Sem inversão da conclusão:** uma parede que impede observar S ataca a oportunidade de observação. Isso não prova que S seja falso. Uma imagem compatível com S tampouco prova que W o tenha visto ou falado sinceramente.

## Política conservadora do primeiro piloto
É uma escolha de avaliação, não a única semântica possível da literatura:
1. Falha de parsing/estrutura → structural fail; não construir argumento.
2. Premissa ordinária contradita ou exceção relevante estabelecida → defeated para aquele argumento.
3. Premissa necessária ausente/insuficiente, pressuposto sem declaração ou CQ obrigatória desconhecida → unresolved.
4. Premissas suportadas, pressupostos explicitamente aceitos no cenário e verificações críticas resolvidas sem derrotador → provisionally_supported.
5. Preservar o conjunto de críticas e justificativas; nunca produzir “juridicamente válido”.

Para precedentes (fora do piloto), uma exceção existencial deve ser resolvida no conjunto de casos especificado. Não encontrar um contraexemplo numa busca incompleta não prova inexistência.

## Semântica: protocolo de anotação
Criar conjunto de referência com duas anotações independentes e adjudicação de divergências; isso é uma proposta, não trabalho concluído.
Comparar átomos por significado com mapeamento documentado de sinônimos. Conferir entidade, papel relacional, negação, tempo, local, modalidade e quantidade. Reportar separadamente:
- conclusão correspondente;
- recuperação da premissa omitida;
- premissas adicionais sem suporte;
- troca de participantes e mudança de força modal.
Um avaliador LLM pode auxiliar, mas sua avaliação fica rastreável e é aferida contra revisão humana. A política permissiva de conclusões meteorológicas não deve apagar qualificadores juridicamente relevantes.

## Experimentos controlados propostos
Usar os mesmos casos nas quatro condições do projeto (todos os insumos, sem imagem, sem contexto, sem entimema), definindo exatamente o texto removido em cada uma. Acrescentar imagem trocada e imagem com oclusão. Prevenir que legenda, filename, exemplo few-shot ou gabarito revele a premissa retirada.
Dividir treino/teste por caso e cena, não por pequenas variações da mesma imagem. Registrar modelo/versão, parâmetros, prompt, imagem/hash, resposta integral e parsing, sem misturar gabarito ao prompt de execução.
Não executar modelos pagos nem enviar PDFs privados a serviços externos nesta etapa.

## Métricas propostas
- Taxa de parsing e conformidade estrutural, por esquema.
- Precisão/recall/F1 de premissas factuais recuperadas, com correspondência adjudicada.
- Taxa de premissas adicionadas sem suporte (denominador: premissas factuais adicionadas).
- Correspondência da conclusão, separada das premissas.
- Suporte visual: proporções supported/contradicted/insufficient, por premissa visual.
- Abstenção apropriada em casos insuficientes; sobreafirmação em casos inconclusivos.
- Cobertura e acerto das CQs, sem interpretar preenchimento como resolução.
- Diferença pareada entre condição completa e sem imagem/trocada, com contagens por caso e intervalos de incerteza quando houver amostra suficiente.

Nenhum número de desempenho é atribuído antes dos experimentos.

