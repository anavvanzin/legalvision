# INE410159 · Expansão de Casos Jurídicos Visuais (AO 399, AO 440 e AO 441), Adjudicação em Nuvem e Fundamentação Normativa/Acadêmica

Este plano integra os três formulários processuais federais norte-americanos (**AO 399**, **AO 440** e **AO 441**) como casos estruturados de argumentação jurídica visual para a disciplina INE410159, modelando **Classificação Verbal** e **Regra Estabelecida** sobre prazos processuais (21, 60 e 90 dias) sob as *Federal Rules of Civil Procedure* (Regras 4 e 12), com persistência de revisões humanas no **Firebase Firestore**, consulta normativa fundamentada via **Google Search Grounding (`gemini-3.8-flash`)** e descoberta de literatura acadêmica via **OpenAlex**.

### User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo refletem exatamente as escolhas confirmadas na etapa de esclarecimento, preservando integralmente as regras do repositório (`AGENTS.md`): separação estrita entre `model-input` e `evaluator-only`, preservação de todos os arquivos e hashes históricos, e distinção rigorosa entre rascunhos/fixtures e revisões humanas autenticadas.

- **Decisão Confirmada 1 — Estatuto dos Formulários AO 399, AO 440 e AO 441**: Os três documentos entram no sistema como **casos jurídicos formais de esquemas de argumentação (CASE02, CASE03 e CASE04)**, mantendo a rastreabilidade de campos visuais, regiões normalizadas e separação entre evidência observada na página e regra normativa estipulada/positivada.
- **Decisão Confirmada 2 — Esquemas e Elementos Modelados**: Foco nos esquemas **Classificação Verbal (`verbal_classification`, Esquema #3)** e **Regra Estabelecida (`established_rule`, Esquema #4)** aplicados à determinação derrotável dos prazos de resposta (**21 dias**, **60 dias** e **90 dias**) conforme a classificação visual do documento (citação ordinária vs. denunciação da lide vs. termo de renúncia de citação) e dos sujeitos/condições (réu privado nos EUA, envio fora dos EUA, ou União/agência/oficial federal sob Fed. R. Civ. P. 4(d) e 12(a)(1)–(3)).
- **Decisão Confirmada 3 — Integrações Ativas (Firebase, Google Search Grounding e OpenAlex)**:
  1. **Firebase Auth & Firestore**: Autenticação Google para identificar revisores humanos (ex.: Ana e Guilherme) e persistir no Firestore as revisões humanas, adjudicações de átomos/regiões e status (`draft` vs. `human_verified`).
  2. **Google Search Grounding (`gemini-3.8-flash`)**: Consulta sob demanda (acionada explicitamente pelo pesquisador no painel do avaliador, nunca misturada ao `model-input` do candidato) para verificar texto atualizado, notas do comitê consultivo e jurisprudência sobre **Fed. R. Civ. P. 4 e 12** com citações verificáveis.
  3. **Literatura Acadêmica (OpenAlex API)**: Bancada de pesquisa bibliográfica conectada à API pública do OpenAlex para buscar artigos sobre *argumentation schemes*, *legal visual argumentation*, *Walton*, *Gordon*, *Bench-Capon* e *defeasible legal reasoning*, reconstruindo resumos (`abstract_inverted_index`) e links DOI/Open Access.

---

### 1. Overview & Core Concept

- **O que a aplicação faz**: Amplia a bancada de inspeção e validação de INE410159 com um módulo dedicado aos casos documentais **AO 399 (`CASE02`)**, **AO 440 (`CASE03`)** e **AO 441 (`CASE04`)**, permitindo inspecionar visualmente cada página dos formulários com sobreposição de regiões normalizadas, instanciar e validar os esquemas de **Classificação Verbal** e **Regra Estabelecida** sobre prazos processuais (21/60/90 dias), registrar adjudicações humanas autenticadas no **Firestore**, e consultar fundamentação normativa (**Google Search Grounding**) e bibliográfica (**OpenAlex**).
- **Público-Alvo / Persona**: Pesquisadores do Grupo 26 (Ana Vitória Vanzin Mendes e Guilherme Trajano) e avaliadores de INE410159 na condução de auditoria formal, anotação humana duplo-cega e validação de esquemas argumentativos multimodais.
- **Valor Principal**: Conecta documentos jurídicos reais de alta estruturação visual-normativa (formulários oficiais AO da Justiça Federal dos EUA) ao rigor formal dos esquemas de Walton & Gordon, garantindo rastreabilidade entre região da imagem, premissa de classificação, regra processual aplicável e questão crítica derrotadora.

---

### 2. User Experience & Visual Design

- **Fluxos Principais do Usuário**:
  1. **Bancada de Casos Processuais Federais (`CASE02: AO 399`, `CASE03: AO 440`, `CASE04: AO 441`)**:
     - Seleção rápida por botões de caso no topo da bancada (com pré-carregamento automático do `CASE02 · AO 399` para nunca exibir tela vazia).
     - **Painel Esquerdo (Inspetor Visual de Página e Regiões)**: Visualização de alta nitidez das páginas dos formulários (`AO 399 p.1`, `AO 440 p.1–2`, `AO 441 p.1–2`) com caixas delimitadoras normalizadas interativas destacando cabeçalho de identificação (`AO 399`, `AO 440`, `AO 441`), cláusula de prazo (`21 days`, `60 days`, `90 days`), qualificação das partes (`Plaintiff`, `Defendant`, `Third-party plaintiff`, `Third-party defendant`, `U.S. agency/officer`) e blocos de assinatura/declaração.
     - **Painel Direito (Instanciação Formal e Validador `verbal_classification` + `established_rule`)**: Alternância entre os dois esquemas, exibindo os predicados (`classified_as`, `classification_warrant`, `applies_established_rule`, `deontic_deadline_obligation`), as premissas vinculadas às fontes (`IMG_AO399`, `IMG_AO440`, `IMG_AO441` vs. `RULE_FRCP4`, `RULE_FRCP12`), as Questões Críticas (`CQ1`–`CQ3`, incluindo exceções como `not excuses(E)` / justa causa ou citação fora dos EUA) e o verificador mecânico em tempo real.
  2. **Fluxo de Revisão e Adjudicação Humana (Firebase Auth + Firestore)**:
     - Login com conta Google no cabeçalho contextual da bancada.
     - O revisor autenticado pode inspecionar cada átomo/região de `CASE01` a `CASE04` (ou do lote piloto COMMA), registrar seu parecer (`draft` → `human_verified` ou `disputed`), salvar anotações de adjudicação com carimbo de data/hora do servidor e visualizar o histórico de revisões persistido no Firestore.
  3. **Bancada de Fundamentação Normativa (Google Search Grounding) & Literatura Científica (OpenAlex)**:
     - **Consultor FRCP 4 & 12 (Search Grounding)**: Botões de consulta rápida pré-configurados (ex.: *"Regra 4(d) Waiver of Service: prazo de 60 vs 90 dias e dever de evitar custos"*, *"Regra 12(a)(1)-(3): prazo de 21 dias vs 60 dias para agências/oficiais dos EUA"*, *"Regra 14 e AO 441: obrigações do Third-Party Defendant"*) e busca customizada via backend Express chamando `gemini-3.8-flash` com `googleSearch`, exibindo síntese técnica e links diretos das fontes (`groundingChunks`).
     - **Explorador Bibliográfico OpenAlex**: Chips de busca rápida para autores e temas da auditoria (`"Douglas Walton argumentation schemes"`, `"Thomas F. Gordon Carneades legal"`, `"Trevor Bench-Capon legal case-based reasoning"`, `"visual argumentation law"`) com resolução de entidades, reconstrução de *abstracts*, contagem de citações tabular, badges de acesso aberto (`Open Access`) e possibilidade de salvar referências selecionadas na coleção do projeto no Firestore.

- **Identidade Visual & Tema (Editorial Acadêmico & Bancada Científica de Alta Densidade)**:
  - *Direção Estética*: Preserva a paleta editorial e institucional já estabelecida no projeto (`APRESENTACAO.html`), combinada com a precisão tabular de bancada científica.
  - *Distribuição de Cores (60-30-10)*:
    - **60% Superfície Dominante**: Papel editorial claro (`#FAF8F3`) e cartões de trabalho brancos (`#FFFFFF`).
    - **30% Estrutura e Tipografia**: Tinta principal azul-ardósia profunda (`#142936`), texto secundário (`#4D5E68`) e divisórias de 1px (`#D4DCE0`).
    - **10% Orçamento de Acento e Semântica**: Verde-petróleo institucional (`#146563`) para ações primárias e estados verificados (`supported` / `pass`), âmbar ocre (`#8D550B` / `#D97706`) para alertas metodológicos, rascunhos (`draft`) e pendências (`incomplete` / `unverified`), e carmesim (`#DC2626`) restrito a falhas estruturais ou contradições (`fail` / `mismatch`).
  - *Tipografia e Disciplina Tabular (Regra 2+1)*:
    - Display / Títulos: `Fraunces` (serifada editorial para cabeçalhos de seção e títulos de documentos).
    - Corpo e Controles: `Public Sans` (alta legibilidade em tabelas densas de 12px–14px).
    - Dados, Átomos, Hashes e Prazos: `IBM Plex Mono` com `font-variant-numeric: tabular-nums` obrigatório em contagens, coordenadas `[x0, y0, x1, y1]`, hashes SHA-256 e prazos (`21d`, `60d`, `90d`).
  - *Regras Anti-Slop e Contrato de Layout*:
    - Cabeçalho superior em linha única com 3 zonas estritas (Marca à esquerda, navegação concisa em linha única no centro, ação de autenticação/exportação à direita).
    - Metadados estáticos (hashes, datas, códigos de formulário, contagens de citações) exibidos como texto limpo separado por `·`, sem cápsulas decorativas.
    - Elevação única (`1px solid #D4DCE0`), sem cartões aninhados com sombras múltiplas ou bordas laterais grossas.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1 — Modelagem Formal Dupla (`verbal_classification` + `established_rule`) para AO 399, AO 440 e AO 441**:
  - *Abordagem Escolhida*: Encadear a classificação visual do paratexto/formulário (`classified_as(DOC, form_ao399_waiver | form_ao440_summons | form_ao441_third_party_summons)`) e dos campos de qualificação da parte com o esquema de **Regra Estabelecida** (`established_rule`, Esquema #4, corrigido com `CQ1`, `CQ2` e `CQ3: not excuses(E)`), permitindo derivar derrotavelmente o prazo aplicável (`21_days_from_service`, `60_days_us_government_or_domestic_waiver`, `90_days_foreign_waiver`).
  - *Por quê*: Os formulários AO 399/440/441 contêm literalmente em seu próprio corpo impresso tanto os indicadores visuais de classificação quanto o enunciado textual das regras de prazo da Fed. R. Civ. P. 4 e 12, tornando-os casos exemplares perfeitos para testar a fronteira entre evidência visual na página (`IMG_AO*`) e regra processual (`RULE_FRCP*`).
  - *Alternativas Consideradas*: Usar apenas `verbal_classification` isolado não capturaria a estrutura condicional de exceções de prazo (ex.: réu nos EUA vs. fora dos EUA no AO 399; réu comum vs. oficial/agência dos EUA no AO 440/441; justa causa na Regra 4(d)(2)), que é própria do Esquema #4 (`established_rule`).

- **Decisão 2 — Persistência de Adjudicações no Firebase Firestore com Modo Local Resiliente**:
  - *Abordagem Escolhida*: Provisionar Firebase Authentication (Google Sign-In via `signInWithPopup`) e Cloud Firestore para salvar documentos de revisão humana (`adjudications`, `saved_references`), mantendo toda a leitura estática dos casos e validadores funcional mesmo antes do login, e exigindo autenticação verificada para gravar ou promover uma anotação para `human_verified`.
  - *Por quê*: Atende à regra metodológica central do projeto de que nenhuma anotação assistida por IA deve ser promovida automaticamente a `human_verified`; o login nominal com Google + registro em banco garante autoria humana rastreável (`reviewerUid`, `reviewerEmail`, `reviewerName`, `createdAt` do servidor).

- **Decisão 3 — Isolamento Epistêmico das Chamadas Externas (Search Grounding e OpenAlex)**:
  - *Abordagem Escolhida*: Executar o Google Search Grounding (`gemini-3.8-flash`) exclusivamente via rota de servidor Express (`/api/grounding/frcp`) acionada pelo pesquisador na bancada de apoio, jamais injetando buscas externas no prompt candidato dos experimentos.
  - *Por quê*: Respeita integralmente a diretriz `AGENTS.md` (*"evaluator-only, fontes descritivas e referência nunca entram no candidato ou em RAG/tools do candidato"*) e as diretrizes de segurança do SDK `@google/genai` (chave de API restrita ao servidor `server.ts`).

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Diagrama de Arquitetura e Hierarquia de Componentes**:

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                   Top Bar (3 Zonas: Marca · Navegação · Auth/Export)                 │
└──────────────────────────────────────────┬───────────────────────────────────────────┘
                                           │
       ┌───────────────────────────────────┼───────────────────────────────────┐
       ▼                                   ▼                                   ▼
┌──────────────────────────────┐  ┌────────────────────────────────┐  ┌─────────────────────────┐
│  Bancada Casos Jurídicos     │  │  Adjudicação & Auditoria       │  │ Fundamentação & Ciência │
│  (CASE01 + AO 399/440/441)   │  │  (Grounding COMMA + Firestore) │  │ (FRCP Search + OpenAlex)│
├──────────────────────────────┤  ├────────────────────────────────┤  ├─────────────────────────┤
│ • Seletor CASE01..CASE04     │  │ • Matriz & Achados P1-P3       │  │ • Consultor FRCP 4 & 12 │
│ • Inspetor Visual de Página  │  │ • Painel de Adjudicação Humana │  │   (Search Grounding)    │
│   com Regiões [x0,y0,x1,y1]  │  │   (draft -> human_verified)    │  │ • Explorador OpenAlex   │
│ • Instanciador Duplo:        │  │ • Histórico Sincronizado       │  │   (Works, Autores, OA)  │
│   - verbal_classification    │  │   via onSnapshot (Firestore)   │  │ • Favoritos Bibliográf. │
│   - established_rule (CQ1-3) │  └────────────────┬───────────────┘  └────────────┬────────────┘
│ • Validador Mecânico Local   │                   │                               │
└──────────────┬───────────────┘                   │                               │
               │                                   ▼                               ▼
               │                   ┌────────────────────────────────┐ ┌─────────────────────────┐
               └──────────────────►│   Firebase Client SDK (Web)    │ │ Servidor Express + Vite │
                                   │ • Google Auth (signInWithPopup)│ │ • POST /api/grounding   │
                                   │ • Firestore:                   │ │   (gemini-3.8-flash +   │
                                   │   - /adjudications/{adjId}     │ │    googleSearch tool)   │
                                   │   - /savedWorks/{workId}       │ │ • GET /api/openalex/*   │
                                   │   - /users/{uid}/profile/info  │ │   (Proxy c/ retry)      │
                                   └────────────────────────────────┘ └─────────────────────────┘
```

- **Modelo de Dados & Casos Processuais (`CASE02` a `CASE04`)**:
  1. **`CASE02` — Formulário `AO 399 (01/09)` (*Waiver of the Service of Summons*)**:
     - *Fatos Visuais Observáveis*: Cabeçalho `"AO 399 (01/09) Waiver of the Service of Summons"`, corte `"UNITED STATES DISTRICT COURT"`, título `"WAIVER OF THE SERVICE OF SUMMONS"`, cláusula de prazo condicional (`"within 60 days from _____, the date when this request was sent (or 90 days if it was sent outside the United States)"`), rodapé normativo `"Duty to Avoid Unnecessary Expenses of Serving a Summons"` citando `"Rule 4 of the Federal Rules of Civil Procedure"`, e barra paratextual inferior (`Print`, `Save As...`, `Reset`).
     - *Instância `verbal_classification` + `established_rule`*: Classifica o instrumento como `waiver_of_service_ao399`; aplica a Regra 4(d)(3) estipulando prazo derrotável de **60 dias** (envio doméstico nos EUA) ou **90 dias** (envio fora dos EUA), sujeito às questões críticas `CQ1` (aplicabilidade da regra ao caso), `CQ2` (força do suporte visual sobre a data/local de envio preenchidos) e `CQ3` (`not excuses(E)`: existência de `"good cause"` sob a Regra 4(d)(2) ou defesa de jurisdição/foro preservada pela Regra 4(d)(5)).
  2. **`CASE03` — Formulário `AO 440 (Rev. 06/12)` (*Summons in a Civil Action*, Páginas 1 e 2)**:
     - *Fatos Visuais Observáveis*: Cabeçalho `"AO 440 (Rev. 06/12) Summons in a Civil Action"`, cláusula de prazo duplo (`"Within 21 days after service of this summons on you ... — or 60 days if you are the United States or a United States agency, or an officer or employee of the United States described in Fed. R. Civ. P. 12 (a)(2) or (3)"`), bloco de assinatura do `"CLERK OF COURT"`, e Página 2 `"PROOF OF SERVICE"` sob `"Fed. R. Civ. P. 4 (l)"` com 5 caixas de seleção de modalidade de citação e declaração sob pena de perjúrio.
     - *Instância `verbal_classification` + `established_rule`*: Distingue o prazo ordinário de **21 dias** (Fed. R. Civ. P. 12(a)(1)(A)(i)) da regra especial de **60 dias** para entes/oficiais federais (Fed. R. Civ. P. 12(a)(2)–(3)), vinculando a eficácia do prazo à comprovação de citação na Página 2 (`Proof of Service`).
  3. **`CASE04` — Formulário `AO 441 (Rev. 07/10)` (*Summons on a Third-Party Complaint*, Páginas 1 e 2)**:
     - *Fatos Visuais Observáveis*: Cabeçalho `"AO 441 (Rev. 07/10) Summons on Third-Party Complaint"`, estrutura tripartite de partes (`Plaintiff` v. `Defendant, Third-party plaintiff` v. `Third-party defendant`), obrigação dupla de serviço da resposta (`"must serve on the plaintiff and on the defendant an answer ... Within 21 days ... or 60 days"`), cláusula facultativa quanto à petição inicial original (`"You may – but are not required to – respond to it"`), e Página 2 `"PROOF OF SERVICE"` com botão paratextual adicional `"Add Attachment"`.
     - *Instância `verbal_classification` + `established_rule`*: Formaliza a obrigação composta do terceiro réu (`third_party_defendant`) sob as Regras 12 e 14, exigindo resposta à *third-party complaint* em **21 ou 60 dias** (conforme qualificação subjetiva) e distinguindo-a da resposta facultativa à *plaintiff's complaint*.
  4. **Coleções Firestore (`firebase-blueprint.json` e `firestore.rules`)**:
     - `/adjudications/{adjudicationId}`: Armazena revisões humanas de casos (`caseId`, `schemeId`, `targetId`, `decision` em `['human_verified', 'disputed', 'draft']`, `notes`, `reviewerUid`, `reviewerName`, `createdAt`, `updatedAt`), com regras de segurança validando `request.auth.uid == incoming().reviewerUid`, limites estritos de tamanho de string e carimbo `request.time`.
     - `/savedWorks/{workId}`: Artigos acadêmicos do OpenAlex salvos pelo pesquisador (`openalexId`, `title`, `doi`, `publicationYear`, `citedByCount`, `caseTag`, `ownerUid`, `createdAt`), restritos por leitura/escrita ao proprietário autenticado.

- **Mapeamento de Interações e Estado**:
  - **Troca de Caso (`CASE01`..`CASE04`) e Página (`Página 1` / `Página 2`)**: Atualiza imediatamente o canvas visual, as regiões normalizadas `[x0, y0, x1, y1]`, o esquema selecionado (`verbal_classification` ou `established_rule`) e o JSON candidato no verificador mecânico.
  - **Submissão de Adjudicação Humana**: Valida campos localmente conforme os limites do `firebase-blueprint.json`, grava via `setDoc`/`addDoc` com tratamento estruturado de erros (`handleFirestoreError`) e atualiza em tempo real a lista de revisões via `onSnapshot`.
  - **Consulta Search Grounding & OpenAlex**: Dispara requisições para `/api/grounding/frcp` e `/api/openalex/works` com indicadores de carregamento, tratamento de erros e botões para vincular a evidência normativa ou artigo diretamente ao caso em inspeção.
