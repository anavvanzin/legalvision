# Ambiente, setup e reprodução

[Preflight real no Mac](preflight-mac/README-RESULTADO.md), [log](preflight-mac/run.log) e [registro](preflight-mac/run.json). Python 3.11.17 ARM64; dry-run conferiu 90 casos/PNGs por presença e assinatura, 24 arquivos e 720 pares salvos, sem pendências. Exit global 1 exclusivamente por SDKs ausentes no Python testado; arquivos e validação passaram.

O checker histórico está em `preflight-mac/check_cv.py`; não instala pacotes, não abre credenciais e só aceita o blob conhecido no dry-run. Caminhos e horários dos logs são registros da execução original, não ambiente reconfigurado nesta organização. Snapshot/checkout integral de cerca de 120 MB foi preservado no workspace de origem, fora deste projeto portátil.

**Setup AI Studio não é métrica:** erros de configuração, acesso, seleção de modelo, schema/interface ou autenticação devem ficar em registro de ambiente. Nenhuma resposta de Gemma foi obtida neste piloto. Não criar linha de resultado com acurácia zero por erro de setup.

DGX permanece sem confirmação de acesso. GitLab privado anteriormente solicitado tem status não confirmado; não foi criado, publicado ou consultado autenticadamente nesta organização. [Projeto na barra lateral do Codex](CODEX-PROJETO.md).
