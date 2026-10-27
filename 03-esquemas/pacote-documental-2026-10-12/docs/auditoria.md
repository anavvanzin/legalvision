# Auditoria dos dez esquemas jurídicos
Data: 12/10/2026. Projeto INE410159, Grupo 26. Documento de trabalho para discussão; não registra aprovação de Guilherme nem resultados experimentais.

## Escopo e evidências
Foram lidas a [reunião de 8/10](https://app.notion.com/p/3f4158101a0580ad812af4fdad40b193), a [base jurídica](https://app.notion.com/p/812158101a058238aecb012bb3ccbd40), os três PDFs anexados à base e o validador de Guilherme.
A comparação distinguiu: T = transcrição ou inconsistência interna demonstrável; A = adaptação de representação, cuja adequação depende de uma convenção explícita; L = falha de suporte inferencial ou de implementação potencial. “L” não significa que todo esquema derrotável deva ser dedutivamente válido.

Fontes lidas:
- **R1 — Gordon e Walton (2009)**. Legal Reasoning with Argumentation Schemes. ICAIL, pp. 137–146. DOI: [10.1145/1568234.1568250](https://doi.org/10.1145/1568234.1568250). PDF anexado, 10 páginas. Classificação: p. 140; analogia e esquemas de precedentes: p. 142; testemunho e exceções: pp. 143–144. Fonte direta das tabelas 8–10.
- **R2 — Wyner e Bench-Capon**. Argument Schemes for Legal Case-based Reasoning. PDF anexado, especialmente §2 e §2.1 (páginas 3–5 do PDF) e §5 (início na página 9 do PDF). Distingue premissas ordinárias, pressupostos e exceções. A versão extensa de Preference-From-Precedent inclui conjuntos de fatores e exceção de precedente mais forte; não é idêntica à apresentação condensada de R1.
- **R3 — Walton**. Using argumentation schemes to find motives and intentions of a rational agent. Argument & Computation 10, pp. 233–275, DOI [10.3233/AAC-190480](https://doi.org/10.3233/AAC-190480). O PDF traz 2019 no volume; registros externos indicam publicação online em 2020. Manter essa distinção bibliográfica. Pp. 233–234: intenção é uma hipótese sobre estado interno; p. 256: reconstrução de premissa implícita em testemunho. Não contém o catálogo integral das dez formulações da página.
- **R4 — código observado**. [validation.py](https://github.com/GuiT2002/comma2026-multimodal-argumentation/blob/d374ac21ca0645c4a49e8ad719a1845afe8754f7/validation.py), commit `d374ac21ca0645c4a49e8ad719a1845afe8754f7`. `scheme_correct` testa inclusão de três nomes de predicados; o avaliador semântico compara apenas conclusões. Serve ao protocolo meteorológico original, não certifica os novos esquemas.

Os anexos não permitem confirmar, linha por linha, a origem exata da versão 2 de analogia, das duas CQs da classificação, das CQs de regra/exceção, das cinco CQs de testemunho ou de Ad Populum. Nesses pontos preservamos o original e registramos a lacuna, sem atribuir páginas de livros não consultados.

## Resultado por esquema
### 1. Argument from Analogy — versão 1
**Comparação:** tabela, regra `correct(P,C1) → correct(P,C2)` sob `similar(C1,C2)` e texto são compatíveis com a forma resumida de R1, p. 142.
**A/L:** `correct` não declara como codificar proposição falsa: é preciso escolher proposições assinadas, por exemplo `not(P)`, ou um campo de polaridade. Sem isso, “true/false” pode colapsar. Similaridade visual não equivale a relevância jurídica. As CQs não estão presentes na página; não inventar que foram satisfeitas.
**Ação:** original preservado. Para uso experimental, declarar polaridade, fatores relevantes e diferenças capazes de derrotar a analogia.
**Imagem:** uso auxiliar; pode fornecer atributos para comparar casos, mas não decidir sua relevância normativa.

### 2. Argument from Analogy — versão 2
**T/A:** a tabela tem uma premissa autônoma de relevância. O código guarda `S` em `similarity(S)`, porém não verifica a relação de S com P; o texto afirma essa relevância sem ligação formal explícita.
**L condicional:** se `similar(C1,C2,similarity(S))` significar apenas semelhança observada, a regra permite transferir P por semelhança irrelevante. Se o predicado já embutir relevância, a adaptação pode ser deliberada, mas falta sua definição.
**Ação:** preservar a regra e anotar a obrigação de declarar esse contrato. Proposta separada: acrescentar `relevant_similarity(S,P,C1,C2)`. Não apresentá-la como transcrição literal de Walton.
**Imagem:** auxiliar. Um atributo comum, como cor, não sustenta por si só o mesmo desfecho jurídico.

### 3. Defeasible Argument from a Verbal Classification
**Comparação:** R1, p. 140, apresenta uma variante que liga propriedade individual e regra classificatória. A base usa pertencimento a C e consequência F. São representações relacionadas, mas não formulações textualmente idênticas.
**T/A:** `categorie` pode ser um nome escolhido, não erro lógico em si. `property(C,F)` confunde propriedade da categoria com regra distributiva sobre seus membros, salvo contrato explícito. CQ2 questiona a classificação A/C, mas `weak(A,F)` menciona a propriedade concluída; sua assinatura não está documentada.
**L:** “All C is F” apaga a modalidade derrotável. `not doubt` e `not weak` não podem converter ausência de informação em certeza.
**Ação:** corrigir o texto explicativo para “Normally, an item classified as C has F… defeasibly”, preservando predicados e CQs e registrando dúvidas de assinatura. Perfil proposto: `classified_as(A,C)` + `classification_warrant(C,F)` ⇒ `has_property(A,F)`; estados de CQ explícitos.
**Imagem:** prioridade 1. Extrair a premissa factual de classificação, com definição operacional de C fornecida. Norma, jurisdição, vigência e consequência jurídica vêm do contexto, não dos pixels.

### 4. Argument from an Established Rule
**T confirmado:** o segundo `cq2`, associado a `excuses(E)`, corresponde a CQ3 da própria tabela. Corrigir para `cq3`.
**A/L:** `carry_out(X,A)` precisa significar obrigação, não ocorrência factual. `B` e `E` não estão ligados à regra/caso; uma exceção de outro caso poderia ser aplicada indevidamente. A presença de `cq(...)` não demonstra que o motor a executa.
**Ação:** corrigir somente o identificador duplicado; preservar formalização e anotar escopo, modalidade deôntica e política de exceções pendentes.
**Imagem:** secundário. Pode provar um fato de incidência ou exceção, mas não estabelecer a obrigação.

### 5. Argument from an Exceptional Case
**Comparação:** núcleo tabela/regra/texto é consistente: caso excepcional permite afastar regra. R1 e R2 sustentam a distinção entre exceção e premissa, mas não confirmam literalmente as três CQs da página.
**A/L:** `inapplicability_evidence(EVIDENCE)` e `comparable_cases(CC)` não ligam evidência à RULE/CASE. CQ2 é condicional à falta de reconhecimento; CQ3, à situação limítrofe. Tornar as três obrigatórias e simultâneas mudaria o esquema. `waived_rule` precisa significar permissibilidade de afastamento, não prova de decisão já proferida.
**Ação:** preservar original; documentar esses vínculos antes de execução.
**Imagem:** auxiliar. Um obstáculo visível pode ser dado factual, mas não constitui automaticamente uma exceção juridicamente reconhecida.

### 6. Argument from Witness Testimony
**T:** título corrigido de “Testemony” para “Testimony”. A tabela contém apenas duas premissas, embora código e texto incluam declaração e conclusão; isso é uma incompletude demonstrável da apresentação.
**A deliberada:** o código está explicitamente marcado “Adapted”. Conserva domínio D, relação S/D e premissa de sinceridade. R1, p. 143, apresenta uma variante com falta de confiabilidade como exceção; não substituir silenciosamente uma pela outra.
**L:** `credible(W,D)` não é equivalente às cinco CQs (consistência interna, fatos externos, outros relatos independentes, viés e plausibilidade). Não há cobertura individual delas no código. “Posição para conhecer D” também não comprova oportunidade de observar S em certo local/tempo.
**Ação:** completar a tabela com a declaração e a conclusão já expressas no código, mantendo a indicação de adaptação. Preservar a regra original e propor perfil separado com as cinco verificações.
**Imagem:** prioridade 2. Usar para sustentar ou contestar possibilidade de observação e compatibilidade com fatos. Uma câmera com outro ângulo não reproduz automaticamente o campo visual de W. Foto do rosto não prova sinceridade, viés ou intenção.

### 7. Position-to-know Ad Populum
**Comparação interna:** premissas e conclusão são consistentes entre tabela, código e texto. A variante exata não foi localizada nos três anexos.
**A/L:** `everybody_in(G,accepts(A))` é uma representação comprimida; precisa de domínio de membros e quantificação universal. Encontrar alguns membros de acordo não satisfaz “todos”. Nenhuma CQ consta na página; ausência de oposição não comprova consenso informado.
**Ação:** preservar integralmente e registrar conferência bibliográfica pendente.
**Imagem:** inadequado como primeiro piloto; uma multidão ou símbolos de concordância não demonstram crença universal nem posição epistêmica do grupo.

### 8. Counterexample
**Comparação:** tabela e regra acompanham R1, p. 142, inclusive decisão oposta e relação direcionada `more_on_point(PC2,PC1)`.
**T/A:** o texto “PC2 and PC1 has more on point of similarity” torna a comparação simétrica e omite o caso atual. Corrigir para a direção PC2 > PC1 no contexto do caso atual.
**L de implementação:** `other_party(P)` é termo funcional; o motor precisa avaliá-lo ou traduzi-lo para relação explícita. Não é automaticamente igual à constante `defendant`. A assinatura binária de `more_on_point` pressupõe caso atual fixo em R1; em lote, explicitar CC evita mistura.
**Incerteza preservada:** a definição conjuntista impressa em R1 apresenta uma combinação de interseções que merece conferência antes de virar algoritmo. Não substituir por uma fórmula presumidamente correta.
**Imagem:** inadequado como extração direta; depende de decisões e fatores juridicamente anotados.

### 9. Preference from Precedent
**T/L confirmado por R1, p. 142:** contraexemplo está na posição de exceção, não de premissa positiva. A regra atual exige aquilo que deveria enfraquecer o argumento. A conclusão `factors_favor(P,PC2)` introduz um segundo argumento ausente da tabela; o texto favorece PC1, que é caso, e não P, que é parte.
**Ação:** alinhar conclusão com `factors_favor(P)`, separar `exists PC2: is_counterexample(PC2,PC1)` como exceção e corrigir a conclusão em linguagem natural para P. A nova notação é conceitual, não sintaxe declarada compatível com o motor de Guilherme.
**Escopo:** como na tabela de R1, caso atual e questão estão fixos. Uma API para múltiplos casos deve usar, por exemplo, `factors_favor(CC,Q,P)` em conjunto com adaptação do esquema 10; não misturar assinaturas.
**Wolfram:** para uma ilustração booleana com premissa D e exceção conhecida E, D∧E e D∧¬E não são equivalentes. Com D=verdadeiro e E=verdadeiro, só a versão equivocada dispara; com E=falso, só a versão corrigida dispara. Isso verifica polaridade, não implementa semântica derrotável nem resolve E desconhecido.
**Imagem:** não selecionar para o primeiro piloto.

### 10. Factor Comparison
**T confirmado:** `deffendant` → `defendant`.
**A/L pendentes:** R1, p. 142, usa constantes de parte; `plaintiff(P)` e `defendant(P)` são termos compostos e precisam de convenção própria. Q ocorre apenas na cabeça: uma regra universal irrestrita poderia concluir qualquer Q. Na fonte, Q é a questão fixa da base, não variável livre para qualquer afirmação.
**Ação:** corrigir grafia; manter o restante e anotar explicitamente parâmetros CC/Q. Proposta para execução: duas regras com `issue(CC,Q)` e `factors_favor(CC,Q,plaintiff|defendant)`, concluindo Q ou seu complemento. É adaptação operacional, não errata bibliográfica.
**Imagem:** não selecionar diretamente. Fatores pró-autor/réu precisam de anotação jurídica e contexto decisório.

## Decisão metodológica proposta
Selecionar 3 e 6 para o primeiro protocolo. Usar 4/5 apenas como extensões posteriores; 1/2, para comparação assistida; 7–10, fora do primeiro piloto visual. Isso é recomendação desta auditoria, não decisão já tomada pelo grupo.

A validação deve produzir três resultados independentes:
1. **Correspondência semântica:** mesma proposição, entidades, relações, polaridade, tempo, local, quantidade e modalidade; avaliar cada premissa e a conclusão. Uma conclusão correta não compensa uma premissa inventada.
2. **Estrutura formal:** esquema identificado, nomes/assinaturas tipados, unificação dos argumentos, variáveis vinculadas, papel de premissa/exceção, conclusão autorizada e cobertura das CQs. Não basta contar predicados.
3. **Evidência visual:** cada premissa visual remete a imagem/região/instante e recebe suporte, contradição ou insuficiência. A evidência pode ser insuficiente mesmo com forma perfeita e texto semanticamente correspondente.

Separar ainda aceitabilidade derrotável sob uma política explícita de CQs da avaliação jurídica humana. Nenhum indicador se chama “validade jurídica”. “Desconhecido” não significa “falso”, “sem exceção” ou “aprovado”. Contradição de uma premissa bloqueia aquele argumento; não demonstra automaticamente a negação da conclusão.

## Mudanças e preservação
Correções pontuais autorizadas: CQ3 do esquema 4; grafia de defendant do 10; inversão da exceção e conclusão do 9; título/tabela incompleta do 6; direção do texto do 8; modalidade do texto do 3. Predicados e formulações incertas ficam preservados e anotados. Referências anexadas permanecem na base.

