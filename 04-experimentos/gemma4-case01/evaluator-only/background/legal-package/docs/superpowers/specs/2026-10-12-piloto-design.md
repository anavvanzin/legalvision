# Desenho proposto — piloto jurídico visual
Status: proposta para revisão, sem aprovação atribuída ao grupo.

## Intenção e escopo
Repositório independente para apresentar a Guilherme a auditoria e uma extensão de avaliação. O pedido autoriza a documentação e as correções demonstráveis; escolhas de motor e ontologia definitiva permanecem em discussão.
Este é um novo projeto (caminho arquitetural do Superpowers), ainda em estágio documental. O produto desta etapa é a especificação revisável; implementação e execução de modelos são etapas posteriores.

## Alternativas
1. **Perfis por esquema e entrada JSON tipada — recomendada:** comparação verificável e simples, preservando a separação entre observação e norma. Exige adaptador para a saída textual do harness.
2. **Estender as regex do baseline:** pequeno esforço, mas insuficiente para vínculo entre argumentos, exceções ou suficiência visual. Útil só como baseline de presença lexical.
3. **Integrar já um motor de argumentação:** permite semântica explícita de ataques e ônus, mas aumenta as decisões antes de estabilizar os exemplos. Adiar até haver casos anotados.

## Arquitetura proposta
- Catálogo dos dez esquemas e fontes: documentação, sem alegar equivalência executável.
- Dois perfis operacionais: classificação e testemunho.
- Adaptador: resposta do harness → instância tipada; rejeitar ambiguidade.
- Validador estrutural: tipos, aridades, vinculação, papéis e CQs.
- Avaliação semântica/visual: anotações externas ao candidato e revisão rastreável.
- Relatório: quatro eixos independentes; não inferir validade jurídica.

## Contrato
Seguir integralmente docs/validacao.md. Python 3.11+ e biblioteca padrão são a preferência para o primeiro validador; JSON mantém intercâmbio com qualquer harness. Não há dependências de LLM nesta etapa.
Premissas/pressupostos/exceções são papéis distintos. Valores desconhecidos permanecem explícitos. Não usar eval em saídas do modelo. Não aceitar que o próprio candidato se dê um selo de evidência suficiente.

## Evidência de aceitação
tests/acceptance-cases.json descreve casos positivos, negativos e inconclusivos. São oráculos de teste propostos, não medições reais. O check_package.py verifica somente a integridade do pacote e exemplos lógicos elementares.

## Limites
Sem dataset anexado, não há conclusão empírica sobre qualidade visual. Sem definição de motor, a notação do Notion é conceitual. Sem contexto normativo de um caso real, não há conclusão jurídica.

