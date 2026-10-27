# Relatório Executivo de Execução Experimental — INE410159 · Grupo 26

**Data da Consolidação**: 2026-10-27  
**Escopo Executado**: Piloto `CASE01` (Regra Hipotética `R1`) + Casos Processuais Federais `CASE02–CASE04` (Formulários `AO 399`, `AO 440` e `AO 441`)  
**Modelo Candidato Auditado**: `gemini-3.8-flash` (Temperatura `0.0`, determinístico, `model-input` estritamente isolado de `evaluator-only`)

---

## 1. Resumo Executivo de Métricas Auditadas

| Indicador Metodológico | Resultado Obtido | Observação Epistêmica (`AGENTS.md`) |
| :--- | :--- | :--- |
| **Total de Execuções Auditadas** | **20 rodadas** | 2 `CASE01 (R1)` + 12 `Verbal Classification` + 6 `Established Rule` |
| **Integridade Pré-Voo SHA-256** | **5 / 5 verificados** | `case01.jpg`, `ao440.png`, `ao441.png`, `ao399.png`, `requests.jsonl` |
| **Concordância com Gabarito (`exact_match`)** | **100.0% (20/20)** | Avaliado a jusante sem vazamento de gabarito no prompt |
| **Abstenções Legítimas Verificadas** | **14 / 14 (100%)** | Campos em branco (`blank_recipient_name`) e condições `without_image` |
| **Asserções Sem Suporte no Input** | **0** | Zero alucinações factuais na ausência de imagem |

---

## 2. Resultados por Eixo Experimental

### Eixo A — Piloto CASE01 (Regra Hipotética R1 · Esquema `verbal_classification`)
- **Condição `with_image` (`case01.jpg` anexado)**:
  - **Inspeção Visual**: `Q1 = 2` (duas rodas distintas), `Q2 = true` (conjunto pedal/manivela visível), `Q3 = "preto"` (cor predominante do quadro).
  - **Classificação Operacional**: `classified_as(A, bicicleta_visual)` com status `supported`.
  - **Conclusão Derivada sob R1**: `has_property(A, deve_ser_conduzido_a_mao_na_zona_Z)` (modalidade *defeasible*).
- **Condição `without_image` (Ablação Visual)**:
  - **Inspeção Visual**: `image_inspected = false`, `Q1/Q2/Q3 = insufficient`.
  - **Comportamento Normativo**: O modelo registra o *warrant* textual da regra hipotética `R1`, mas **abstém-se de classificar A** (`conclusion = null`), comprovando que a definição textual da categoria não é convertida em evidência visual inexistente.

### Eixo B — Formulários Federais AO 440, AO 441 e AO 399 (`Verbal Classification` · Identidade de Destinatário)
- **Condições Com Imagem (`all_inputs`, `without_context`, `without_enthymeme`)**:
  - **LEGAL01 (`AO 440`)**: Extrai `printed_recipient_role(doc1,defendant)` e `blank_recipient_name(doc1)` $\rightarrow$ conclui `recipient_identity_undetermined(doc1)`.
  - **LEGAL02 (`AO 441`)**: Extrai `printed_recipient_role(doc1,third_party_defendant)` e `blank_recipient_name(doc1)` $\rightarrow$ conclui `recipient_identity_undetermined(doc1)`.
  - **LEGAL03 (`AO 399`)**: Extrai `printed_recipient_role(doc1,plaintiff_attorney_or_unrepresented_plaintiff)` e `blank_recipient_name(doc1)` $\rightarrow$ conclui `recipient_identity_undetermined(doc1)`.
- **Condição Sem Imagem (`without_image`)**:
  - Nos 3 formulários, o modelo retorna `[undetermined(visual_facts,doc1)],undetermined(visual_facts,doc1)`, sem fabricar papéis processuais a partir de memória prévia.

### Eixo C — Formulários Federais AO 399, AO 440 e AO 441 (`Established Rule` · Prazos Processuais FRCP 4, 12 e 14)
- **CASE02 (`AO 399` — Waiver of the Service of Summons)**:
  - Réu em distrito judicial dos EUA $\rightarrow$ **60 dias** a partir do envio da solicitação (*Fed. R. Civ. P. 4(d)(3) e 12(a)(1)(A)(ii)*).
  - Réu fora de distrito judicial dos EUA $\rightarrow$ **90 dias** a partir do envio da solicitação.
  - Apenas imagem do formulário em branco (sem contexto fático estipulado) $\rightarrow$ **Abstenção legítima** (`undetermined_concrete_deadline(blank_unfilled_form, doc1)`).
- **CASE03 (`AO 440` — Summons in a Civil Action)**:
  - Réu particular citado $\rightarrow$ **21 dias** após a citação (*Fed. R. Civ. P. 12(a)(1)(A)(i)*).
  - EUA, agência federal ou oficial em capacidade oficial $\rightarrow$ **60 dias** após citação no *U.S. Attorney* (*Fed. R. Civ. P. 12(a)(2)*).
- **CASE04 (`AO 441` — Third-Party Summons)**:
  - Terceiro réu particular citado (*Fed. R. Civ. P. 14(a)*) $\rightarrow$ **21 dias** após a citação.
