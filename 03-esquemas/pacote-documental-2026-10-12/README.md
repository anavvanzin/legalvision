# Legal Visual Argumentation
Protótipo documental independente para o Grupo 26 · INE410159 · 12/10/2026.

**Pergunta:** um modelo multimodal recupera uma premissa factual visualmente sustentada e a conecta a um esquema jurídico sem inventar suporte, exceções ou consequências?

Este repositório prepara a auditoria e o protocolo de avaliação para apresentar a Guilherme. **Ainda não contém um motor de inferência, integração com modelos, dataset visual ou resultados de experimentos.** Os exemplos são especificações sintéticas de testes a implementar.

## Comece aqui
1. [Auditoria dos dez esquemas](docs/auditoria.md).
2. [Contrato de validação](docs/validacao.md): semântica, estrutura, evidência e CQs.
3. [Desenho do piloto](docs/superpowers/specs/2026-10-12-piloto-design.md).
4. [Plano de implementação](docs/superpowers/plans/2026-10-12-piloto.md).
5. [Catálogo auditado](schemes/catalog.json), [dois perfis propostos](schemes/profiles.json) e [casos de aceitação](tests/acceptance-cases.json).
6. [Apresentação em cinco minutos](docs/apresentacao.md).

## Relação com o projeto existente
É uma contribuição paralela, não um fork nem uma substituição do projeto [comma2026-multimodal-argumentation](https://github.com/GuiT2002/comma2026-multimodal-argumentation).
O código original foi apenas consultado no commit `d374ac21ca0645c4a49e8ad719a1845afe8754f7`; nenhum arquivo ou resultado foi alterado.
O critério `position_to_know + asserts + contain` permanece identificável como baseline legado, sem ser promovido a teste genérico de validade.

## Fontes e rastreabilidade
- [Reunião](https://app.notion.com/p/3f4158101a0580ad812af4fdad40b193)
- [Base jurídica corrigida](https://app.notion.com/p/812158101a058238aecb012bb3ccbd40)
- [Auditoria no Notion](https://app.notion.com/p/3f7158101a058169942be954b87b3066)
- [Registro de correções](docs/correcoes.md)
- [Manifesto dos anexos consultados](sources/manifest.json)

Os PDFs não são redistribuídos neste pacote. Nenhuma licença sobre material de terceiros é presumida. Nenhuma legislação real é codificada; os cenários de teste não são pareceres jurídicos.

## Verificação deste pacote
```bash
python3 scripts/check_package.py
```
O comando verifica integridade do catálogo, cobertura dos casos de aceitação e a tabela booleana da inversão de exceção. **Não executa o validador proposto e não verifica imagens ou validade jurídica.**

## Publicação
Nome sugerido: `legal-visual-argumentation`, namespace `anavvanzin`, visibilidade inicial privada.
O repositório Git local foi preparado. O projeto remoto GitLab ainda não foi criado: a integração conectada não expõe essa operação.
Não foram enviados convites nem mensagens a Guilherme.

