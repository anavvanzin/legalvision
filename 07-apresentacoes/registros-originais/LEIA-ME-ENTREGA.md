# INE410159 - entrega de 13/10/2026

Abra `APRESENTACAO-INE410159-2026-10-13.html` em qualquer navegador. É um resumo estático, sem dependências externas, que pode ser impresso. O relatório detalhado está em `RESULTADOS-INE410159-2026-10-13.md`.

O pacote reúne os resultados locais, logs, hashes e pareceres. Não contém o dataset meteorológico completo, o snapshot de 120 MB ou as cópias Git. Eles permanecem no workspace do Mac. Os arquivos do pacote jurídico em `work/legal-package` são cópias documentais, sem o histórico Git, suficientes para repetir seu check.

## Repetir sem chamadas externas

Depois de extrair o ZIP, entre na pasta extraída e execute:

```sh
python3 -I -B work/legal-package/scripts/check_package.py
```

Para repetir o preflight, use a cópia completa já criada no Mac:

```sh
python3 -I -B preflight/check_cv.py --repo local-workspace:preparation/preflight/checkout
```

O retorno global 1 por SDKs ausentes é compatível com dry-run aprovado. Compare o log; não instale SDKs para esse dry-run.

Para repetir as estatísticas, com o projeto de referência já presente no Mac:

```sh
python3 -I -B https://github.com/GuiT2002/comma2026-multimodal-argumentation/blob/d374ac21ca0645c4a49e8ad719a1845afe8754f7/statistics.py
```

Os registros JSON contêm os comandos originais, versões, caminhos e resultados. `MANIFESTO-SHA256.json` registra os hashes dos arquivos deste pacote. Nenhum desses comandos executa modelos. Não execute `main.py` ou `validation.py` sem `--dry-run` para reproduzir esta entrega.

A distinção central: 16 oráculos jurídicos propostos; 720 avaliações meteorológicas salvas; checks de software executados hoje. Ainda não há métrica de modelo jurídico ou extrator visual jurídico implementado nos projetos inspecionados.
