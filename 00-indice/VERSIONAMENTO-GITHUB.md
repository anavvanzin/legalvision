# Cópia preparada para o GitHub privado

Destino autorizado: [anavvanzin/legal-visual-argumentation](https://github.com/anavvanzin/legal-visual-argumentation). A identidade pessoal e a visibilidade privada foram conferidas antes do envio. GitLab e Craft não foram editados nesta publicação; o índice Craft está ligado no README e no mapa.

Esta árvore é uma cópia revisada da pasta central. ZIPs, bundle de recuperação, .DS_Store, recibos da Library e auxiliares locais dispensáveis ficaram no arquivo local. Nenhum original de pesquisa foi apagado ou movido. Somente README e mapa da pasta central receberam os links autorizados.

Caminhos pessoais e de instalação em relatórios históricos foram convertidos em caminhos relativos, repo-path: ou marcadores local-source:/local-workspace:/local-archive:. Esses marcadores identificam proveniência, não são comandos nem garantias de disponibilidade. Os hashes e conclusões históricos foram mantidos; hashes de logs e snapshots anteriores descrevem seus bytes originais, não esta derivação. PUBLICACAO-PROVENIENCIA.json registra a correspondência por arquivo. Os dois manifestos de integridade foram regenerados com escopo explícito desta árvore; o manifesto central exclui a si próprio.

Os sete arquivos de model-input e os dados congelados de fonte, referência e pré-registro conservam os bytes. A fotografia e a captura pública de sua fonte permanecem com atribuição e CC BY-SA 4.0 em evaluator-only. A licença da fotografia não atribui automaticamente uma licença aos demais documentos.

O piloto está pausado: zero execuções candidatas jurídicas, results.jsonl vazio, results.csv somente com cabeçalho. A referência é assistida e provisória; R1 é hipotética. Métricas meteorológicas arquivadas pertencem ao projeto de Guilherme. Checks sintéticos verificam software, sem produzir respostas ou métricas de modelo.

## Checks locais, sem rede ou instalação

Na raiz desta cópia, com Python 3 e biblioteca padrão:

```sh
python3 -I -B 04-experimentos/gemma4-case01/verify_package.py
python3 -I -B 03-esquemas/pacote-documental-2026-10-12/scripts/check_package.py
python3 -I -B -m unittest discover -s 04-experimentos/gemma4-case01/evaluator-only/tools -p test_validate_candidate.py -v
python3 -I -B 00-indice/ferramentas/validar_organizacao.py .
```

O checker documental confere 10 esquemas, 2 perfis, 16 oráculos especificados e 4 linhas booleanas; não executa os 16 oráculos num motor jurídico. A menção Wolfram impressa é histórica. O checker CASE01 usa seis fixtures sintéticos; não lê pixels nem adjudica direito. Recontagens do baseline exigem seu checkout externo, que não foi distribuído aqui. Nenhum workflow, deploy, chamada paga ou retomada de modelo integra esta publicação.
