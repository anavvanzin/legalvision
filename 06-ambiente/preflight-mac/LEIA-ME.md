# Verificador do ambiente — Grupo 26 / INE410159

Inspeção: 13/10/2026. Repositório: https://github.com/GuiT2002/comma2026-multimodal-argumentation
Commit: `d374ac21ca0645c4a49e8ad719a1845afe8754f7`.

## Executar no Mac após a redefinição

Descompacte este pacote. Abra o Terminal na pasta que contém `check_cv.py` e `LEIA-ME.md`. Os comandos abaixo pressupõem `git` e `python3` disponíveis; primeiro confirme:

```bash
command -v git
python3 --version
```

É necessário Python 3.10 ou superior. Se `python3` não existir ou for antigo, instale Python para macOS pelo instalador oficial em https://www.python.org/downloads/macos/ e reabra o Terminal. No M4, prefira Python nativo ARM64; x86_64/Rosetta é informado pelo verificador, não tratado automaticamente como erro. Se Git não estiver disponível, instale as ferramentas de linha de comando da Apple (`xcode-select --install`). Essas instalações são manuais; o verificador não instala nada.

Crie um checkout novo. Não use a pasta de trabalho antiga nem restaure resultados por cima dela:

```bash
CV_CHECKER="$PWD/check_cv.py"
CV_WORKSPACE="$(mktemp -d "$HOME/cv-preflight.XXXXXX")"
git clone https://github.com/GuiT2002/comma2026-multimodal-argumentation.git "$CV_WORKSPACE/repo"
git -C "$CV_WORKSPACE/repo" checkout --detach d374ac21ca0645c4a49e8ad719a1845afe8754f7
python3 -m venv "$CV_WORKSPACE/repo/.venv"
"$CV_WORKSPACE/repo/.venv/bin/python3" -I -B "$CV_CHECKER" --repo "$CV_WORKSPACE/repo"
```

Execute uma linha por vez e pare se clone, checkout ou venv falhar. O verificador pode retornar código diferente de zero porque faltam SDKs, mesmo quando o dry-run passa. Não há necessidade de instalar SDKs para esse teste.

Para completar as dependências do projeto, opcionalmente execute, somente nesse venv:

```bash
"$CV_WORKSPACE/repo/.venv/bin/python3" -m pip install -r "$CV_WORKSPACE/repo/requirements.txt"
"$CV_WORKSPACE/repo/.venv/bin/python3" -m pip check
"$CV_WORKSPACE/repo/.venv/bin/python3" -I -B "$CV_CHECKER" --repo "$CV_WORKSPACE/repo"
```

`pip install` baixa pacotes, mas não executa experimentos nem usa APIs de modelos. O requirements inspecionado contém apenas `openai` e `anthropic`, sem versões fixadas: a instalação não reproduz necessariamente as versões usadas por Guilherme. `pip check` complementa a checagem de metadados do script; o verificador não importa os SDKs e não testa autenticação ou compatibilidade com serviços pagos.

O script tem shebang executável; também pode ser chamado com `chmod +x check_cv.py` e `./check_cv.py --repo CAMINHO`, mas invocar o Python do venv explicitamente evita selecionar outro interpretador.

## O que é verificado

- Python >= 3.10, interpretador, arquitetura, venv, versões dos SDKs e suas dependências ativas por metadados (quando `packaging` estiver disponível).
- Arquivos principais, exatamente três TSVs, registros de dois campos, contagem de respostas esperadas e existência de uma imagem PNG por caso. A assinatura PNG é verificada; não há decodificação completa das imagens.
- `expected_outputs/class1.txt` a `class3.txt` e resultados TXT nas três classes de cada diretório de modelo não oculto. Cópias CSV em `results/` não substituem TXT.
- Execução real de `validation.py --dry-run`: cabeçalhos, quatro colunas experimentais, ordem de casos/imagens, número de linhas e consistência das avaliações salvas que o validador utiliza.

O diretório `validation/` pode não existir. Ausência de avaliações salvas não impede o dry-run. Arquivos órfãos de validação não associados aos modelos atuais não são examinados pelo validador oficial.

O dry-run aprovado significa consistência dos arquivos examinados. Não significa que as respostas dos modelos estão corretas, que todas tiveram julgamento positivo ou que os juízos semânticos foram refeitos. O teste não verifica recuperação de arquivos pessoais do Mac.

## Segurança e diagnósticos

O script não instala pacotes, não abre `.env`, não lê chaves SSH nem pede chaves de API. O processo filho recebe ambiente novo sem as variáveis de credenciais; usa `-I -B` para evitar imports do checkout/PYTHONPATH e gravação de bytecode. Apenas o blob exato de `validation.py` inspecionado é executado, inclusive com segunda checagem no filho. Um audit hook bloqueia operações Python de rede, processos e gravação. Isso é proteção adicional para esse código conhecido, não um sandbox universal para código arbitrário.

Nenhum resultado ou CSV é criado, sobrescrito ou corrigido. Não execute `main.py` ou `validation.py` sem `--dry-run`: esses caminhos podem chamar modelos pagos e gravar resultados. O verificador não oferece esses modos.

| Categoria | Interpretação e ação |
| --- | --- |
| INSTALAÇÃO | Python/SDK ausente ou dependência incompatível. Corrija o interpretador/venv; SDK ausente não bloqueia dry-run. |
| ARQUIVOS | Checkout incompleto, TXT/imagem ausente, TSV inválido ou contagens incompatíveis. Obtenha os arquivos corretos; não regenere resultados. |
| VALIDAÇÃO | Inconsistência detectada pelo validador, erro de execução ou timeout. Leia a mensagem; compare dados e avaliações salvas, sem apagar ou sobrescrever. |
| SEGURANÇA | Código/requirements diferente do inspecionado. Use o commit indicado ou solicite nova revisão; não remova a trava. |

Códigos de saída são uma soma de bits: `0` sem problemas detectados; `1` instalação; `2` arquivos; `4` validação; `8` DGX pendente (modo separado); `16` versão não revisada. Exemplo: `3` = instalação + arquivos; `6` = arquivos + validação. A saída de cada categoria é a fonte mais útil para diagnóstico. Python anterior a 3.10 interrompe a checagem local.

## DGX da UFSC — verificação independente

```bash
python3 -I -B check_cv.py --dgx
```

É um checklist interativo, sem conexões: verifica a disponibilidade local de SSH e pergunta sobre autorização, endpoint oficial, autenticação, VPN e sessão/kernel remoto. Não informe senha, token ou chave. Responda `?` quando desconhecido. O resultado é autodeclarado; não prova acesso. SSH local ausente não impede necessariamente Jupyter pelo navegador.

Antes da prática de quinta-feira, 15/10/2026, 14h–17h (Brasília), obtenha do professor/equipe:

1. Confirmação de que seu usuário está habilitado e de que a atividade usará efetivamente a DGX.
2. URL exata do Jupyter ou host/porta SSH, usuário/método de autenticação e canal de suporte. Não adivinhe endpoints.
3. Orientação sobre rede/VPN e eventual configuração necessária após o reset do Mac.
4. Forma de iniciar sessão, ambiente/kernel autorizado, cotas, armazenamento e disponibilidade de GPU.
5. Confirmação prática: autenticar no endereço recebido e abrir um notebook/kernel, sem executar modelos. Se SSH for exigido, confirme a impressão digital do servidor por canal oficial antes de aceitá-la; não desabilite a verificação do host.

O VLAB@UFSC informa DGX H100 e uma via de solicitação para projetos cadastrados no SIGPEX, com formulário acessível mediante IdUFSC: https://vlab.ufsc.br/deseja-participar/ (consultado em 13/10/2026). Isso não confirma que essa via seja o procedimento da disciplina, nem que sua conta esteja liberada. O compromisso no calendário, por si só, não confirma acesso. Python e CUDA no Mac não habilitam a conta remota; não é necessário instalar CUDA local para usar uma GPU remota.

## Verificação realizada nesta entrega

Em Linux/Python 3.12, o dry-run protegido passou usando o código e os arquivos textuais recuperados do commit indicado: 24 arquivos, 720 avaliações, zero pendentes. SDKs estavam ausentes e as imagens binárias não foram baixadas: a estrutura completa das imagens deverá ser verificada no checkout do Mac. Também foram exercitados arquivos ausentes, resultado malformado, CSV salvo inconsistente, código alterado e DGX sem confirmação. Não houve teste neste Mac ou autenticação na DGX.
