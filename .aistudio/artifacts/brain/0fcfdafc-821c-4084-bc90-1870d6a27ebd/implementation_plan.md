# Exportação JSON Combinada de Adjudicações e Referências na Aba "Apresentação & Status"

Adição de um botão de ação direta na aba **Apresentação & Status** (`apresentacao`) que gera e dispara o download imediato de um arquivo JSON combinado contendo exclusivamente as listas brutas de adjudicações salvas (`adjudications`), obras acadêmicas salvas via OpenAlex (`savedWorks`) e referências bibliográficas base do projeto (`BIBLIOGRAPHIC_SOURCES`).

## Revisão do Usuário e Decisões Confirmadas

> [!IMPORTANT]
> O formato do JSON exportado segue estritamente as escolhas confirmadas: contém apenas as listas brutas de adjudicações e referências (obras OpenAlex salvas no Firestore e catálogo bibliográfico base), sem envelopes adicionais de metadados.

- **Conteúdo Confirmado do Pacote JSON**:
  - `adjudications`: Lista bruta de registros de adjudicação humana salvos na coleção `adjudicationRecords` do Firestore.
  - `savedLiteratureWorks`: Lista bruta de obras acadêmicas salvas pelo pesquisador na coleção `savedOpenAlexWorks` do Firestore.
  - `baseBibliography`: Lista bruta das fontes bibliográficas fundamentais do projeto (`BIBLIOGRAPHIC_SOURCES`).
- **Estrutura de Metadados Confirmada**:
  - **Apenas as listas brutas**: Objeto JSON limpo de primeiro nível (`{ adjudications, savedLiteratureWorks, baseBibliography }`) formatado com indentação de 2 espaços (`JSON.stringify(payload, null, 2)`).

---

## 1. Visão Geral e Conceito Central

- **O Que Faz**: Permite exportar com um único clique, diretamente a partir do cabeçalho da aba **Apresentação & Status**, todas as adjudicações e referências bibliográficas ativas na sessão em um arquivo único `adjudicacoes_e_referencias.json`.
- **Público e Contexto**: Pesquisadores do Grupo 26 (`INE410159`) que desejam arquivar, compartilhar ou auditar externamente as decisões de adjudicação e a base bibliográfica consolidada.
- **Valor Principal**: Acesso instantâneo aos dados brutos consolidados sem cabeçalhos supérfluos, mantendo a estética *Glitch Console (Variation 18)* da aplicação.

---

## 2. Experiência do Usuário e Design Visual

- **Fluxo do Usuário**:
  1. O usuário navega até a aba **APRESENTAÇÃO & STATUS** (`activeTab === 'apresentacao'`).
  2. No cabeçalho da seção principal da aba, ao lado do título e sumário de status do repositório, visualiza o botão de destaque **"BAIXAR ADJUDICAÇÕES & REFERÊNCIAS (.JSON)"** com contador dinâmico de itens (`adjudications.length + savedWorks.length + BIBLIOGRAPHIC_SOURCES.length`).
  3. Ao clicar no botão, o navegador gera o `Blob` (`application/json;charset=utf-8`) e inicia imediatamente o download do arquivo `adjudicacoes_e_referencias.json`.
- **Identidade Visual e Tema**:
  - Estilizado em harmonia com o tema **Variation 18 (`INE410159 // Glitch Console`)**, utilizando tipografia `Space Mono`, borda ciano/magenta (`#00ffff` / `#ff00ff`), fundo `#111111` e feedback imediato de foco e *hover*.

---

## 3. Decisões de Produto e Trade-Offs

- **Decisão 1: Geração Client-Side Síncrona a partir do Estado Sincronizado com o Firestore**
  - *Abordagem Escolhida*: Como os arrays `adjudications` e `savedWorks` já são mantidos em tempo real via `onSnapshot` do Firestore no componente principal, e `BIBLIOGRAPHIC_SOURCES` reside em memória, o download é gerado instantaneamente via `Blob` e `URL.createObjectURL`.
  - *Por quê*: Garante latência zero, funciona mesmo se acionado repetidamente durante uma apresentação e reflete em tempo real qualquer adjudicação ou obra recém-adicionada.

---

## 4. Arquitetura Técnica e Estratégia de Dados

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ABA APRESENTAÇÃO & STATUS (App.tsx)                 │
│                                                                         │
│  ┌───────────────────────┐   ┌───────────────────┐   ┌───────────────┐  │
│  │ adjudications[]       │   │ savedWorks[]      │   │ BIBLIOGRAPHIC │  │
│  │ (Firestore Snapshot)  │   │ (Firestore Snap.) │   │ _SOURCES[]    │  │
│  └───────────┬───────────┘   └─────────┬─────────┘   └───────┬───────┘  │
│              └─────────────────────────┼─────────────────────┘          │
│                                        ▼                                │
│               handleDownloadCombinedAdjudicationsAndRefs()              │
│                                        │                                │
│                                        ▼                                │
│         { adjudications, savedLiteratureWorks, baseBibliography }       │
│                                        │                                │
│                                        ▼                                │
│                  Download: adjudicacoes_e_referencias.json              │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Estrutura Exata do Payload JSON**:
  ```json
  {
    "adjudications": [...],
    "savedLiteratureWorks": [...],
    "baseBibliography": [...]
  }
  ```
- **Mapeamento de Interação**:
  - Função `handleDownloadCombinedAdjudicationsAndRefs` vinculada ao evento `onClick` do botão na aba `apresentacao`, criando elemento `<a>` temporário e revogando o Object URL após o disparo.
