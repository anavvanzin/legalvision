# Conferência mecânica CASE01

`validate_candidate.py` usa somente a biblioteca padrão do Python 3. O código contém um snapshot dos vínculos do perfil proposto `verbal_classification` 0.1 e do contrato CASE01; não depende de arquivos em caminhos absolutos. A origem formal é `work/legal-package/schemes/profiles.json`, esquema 3, com status `proposed_not_implemented`. As restrições do prompt compartilhado limitam `classified_as` a IMG01, enquanto R1 é a fonte textual exclusiva do warrant.

Depois de receber e preservar um export JSON manual, execute:

```sh
python3 validate_candidate.py --candidate caminho/para/export.json --condition with_image
python3 validate_candidate.py --candidate caminho/para/export.json --condition without_image
```

A ferramenta não altera o export. Sua saída stdout é JSON com `findings`, `schema_status`, `binding_status` e `evidence_policy`. Código de saída 0: política e estrutura conferidas, podendo haver abstenção/incompletude; 1: falha de contrato, vinculação ou política; 2: leitura, JSON malformado ou argumentos CLI inválidos. Um arquivo vazio ou template ainda não preenchido não é um candidato e não deve ser passado ao checker.

`binding_status=pass` indica somente cadeia sintaticamente completa de premissas e conclusão com os termos exigidos. `incomplete` indica uma instância parcial sem conflito estrutural identificado, inclusive abstenção com lista vazia ou apenas warrant R1; não é derrota do argumento. Uma cadeia completa pode ter `binding_status=pass` e `evidence_policy=fail`, por exemplo quando a classificação declarada é insuficiente mas o candidato conclui a propriedade normativa. `fail` identifica violação de estrutura ou vinculação. Conclusão exige ambos os átomos completos e a fonte deve ser derivada, representada pela omissão de `source_id` no átomo; até `source_id=null` viola o contrato.

`evidence_policy` verifica apenas as declarações estruturadas: origem textual R1 para a regra, IMG01 somente com imagem inspecionada declarada, classificação `supported` antes de conclusão, e ausência de valores/regiões/status categóricos quando não houve pixels. Não interpreta a prosa dos campos `reason` e não prova que a inspeção declarada ocorreu. Estados de CQ e observações/classificação são preservados como `self_reported`, sem revisão externa independente. Nenhum estado de CQ, isoladamente, é convertido em adjudicação de derrota.

`output.schema.json` é JSON Schema Draft 2020-12 padrão para o contrato de export, sem garantia de suporte nativo por Google AI Studio, Gemma ou qualquer API. O checker implementa conferência stdlib diretamente, sem chamar uma biblioteca de JSON Schema. Ele também confere a ordem das coordenadas de região e rejeita chaves JSON duplicadas, números não finitos e booleanos usados como coordenadas; esses detalhes não são todos expressáveis no schema padrão.

Execute os testes locais com `python3 test_validate_candidate.py` ou `python3 -m unittest -v test_validate_candidate.py`. São seis testes de fixtures fictícias de software, não respostas de modelo, anotação de imagem ou gabarito. A execução direta grava `validator-test-results.json` e `validator-tests.log`, e imprime o resumo JSON. Não foram executados candidatos reais nesta fase.

Esta ferramenta não inspeciona pixels, não lê referências/gabaritos, não consulta direito vigente, não certifica semântica visual e não implementa um validador jurídico completo. A regra R1 é hipotética e os resultados não têm a força de uma avaliação jurídica ou benchmark de modelo.
