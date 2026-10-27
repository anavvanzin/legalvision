# INE410159 — preflight local executado no Mac em 13/10/2026

**Resultado:** a consistência dos arquivos existentes foi aprovada pelo dry-run protegido. O retorno global foi **1, exclusivamente por instalação**: os SDKs `openai` e `anthropic` estão ausentes no Python testado. Não houve falha de arquivos, validação ou versão do código. Não foram executados modelos nem chamadas externas.

## Método e entrada

Fonte local preservada: `https://github.com/GuiT2002/comma2026-multimodal-argumentation`. Referência do grupo: `https://github.com/GuiT2002/comma2026-multimodal-argumentation`.

Commit fixado: `d374ac21ca0645c4a49e8ad719a1845afe8754f7`. O pacote existente `local-source:omitted-host-path` contém `check_cv.py` e `LEIA-ME.md`. Ambos foram lidos antes da execução. O blob Git do `validation.py` local corresponde ao esperado pelo pacote: `ec3de301f0090d628c5ed99d9bb07da655a1c21d`.

Foi produzido um `git archive` somente de arquivos rastreados do commit, extraído em `preflight/checkout`. O checkout de origem não foi alterado; `.DS_Store` não rastreado ficou fora da cópia. Nenhum fetch, clone remoto, instalação, leitura de credenciais, push ou conexão DGX foi feito. Não há `AGENTS.md` ou `.agents/skills` específico nesse repositório; as instruções gerais de `Projetos/AGENTS.md` foram lidas. A única skill encontrada em `Projetos/.agents/skills` é de Composio e não se aplica ao teste offline.

O comando documentado foi executado sobre essa cópia:

```bash
python3 -I -B check_cv.py --repo local-workspace:preparation/preflight/checkout
```

Ambiente efetivamente informado pelo verificador: Python **3.11.17**, arquitetura **arm64**, interpretador `python3`, sem venv ativo. O processo filho recebe ambiente substituído por apenas `PATH`, é executado com `-I -B`, confere novamente o blob e fixa `validation.py --dry-run`. O caminho dry-run retorna antes da importação do SDK, criação do cliente e gravação de CSV; o audit hook bloqueia operações Python usuais de rede/processos/gravação.

## Saída comprovada

| Verificação | Resultado |
|---|---|
| Casos TSV geográficos (`class1`) | 64 |
| Casos TSV temporais (`class2`) | 15 |
| Casos TSV geográficos + temporais (`class3`) | 11 |
| Imagens correspondentes | 90, presença e assinatura PNG verificadas |
| Modelos com resultados TXT existentes | `claude-sonnet`, `deepseek-flash` |
| Arquivos de avaliação esperados | 24 = 2 modelos × 3 classes × 4 configurações |
| Pares de avaliação examinados | 720 = 90 casos × 2 modelos × 4 configurações |
| Pares pendentes | 0 |
| Consistência do dry-run | Aprovada |
| Código de saída global | 1: SDKs ausentes; bits de arquivos/validação/versão = falsos |
| Integridade da cópia de entrada | SHA-256 de todos os arquivos idêntico antes/depois |

As quatro configurações existentes são imagem + contexto, entimema + imagem, entimema + contexto e todas as entradas. Os casos são do domínio meteorológico presente no repositório, e não um conjunto jurídico.

Os campos TSV contêm registros citados multilinha; a contagem de casos acima usa `csv.reader` com delimitador tab. Uma contagem inicial auxiliar por linhas físicas foi corrigida no JSON e no capturador. O log original do verificador, que sempre informou 64/15/11, foi preservado sem alteração.

## O que este resultado permite afirmar

Hoje foi executado um **teste de software e consistência de dados no Mac**. Ele confirma compatibilidade de formatos, contagens, alinhamento de caminho/ordem das imagens e pares salvos, além da recomputação do critério local de presença dos predicados `position_to_know`, `asserts` e `contain`.

O relato anterior no `LEIA-ME.md` dizia 24 arquivos/720 avaliações/zero pendentes em Linux/Python 3.12, sem download de imagens. Agora há uma execução independente no Mac que também verificou presença e assinatura dos 90 PNGs. Não há nova inferência nem novo julgamento semântico: as 720 linhas são avaliações **salvas**, compatíveis com os pares existentes. O relatório não é uma taxa de acerto e não demonstra precisão visual, validade lógica completa, desempenho jurídico ou acesso ao DGX.

## Limitações e bloqueio objetivo

- As imagens não são decodificadas integralmente; são conferidas pelos oito bytes da assinatura PNG.
- O dry-run não confere equivalência textual entre entimema/contexto dos resultados e os TSVs; confere a ordem pelo caminho da imagem.
- O julgamento semântico salvo não é refeito nem vinculado automaticamente à versão histórica do prompt/modelo/juiz. Não se estabelece aqui a procedência temporal das chamadas anteriores.
- O critério de esquema verifica presença de três predicados; não verifica toda a estrutura, semântica ou validade do argumento.
- O audit hook é proteção adicional para o código conhecido, não um sandbox universal; a inicialização/imports prévios ficam fora do hook. A cópia foi fixada por commit e rejeita links no arquivo de captura.
- Os SDKs ausentes impedem executar os caminhos de APIs nesse Python, mas são dispensáveis para o teste realizado. Não foi instalado nada.
- `main.py` exige ao menos uma chave e só implementa clientes remotos de OpenAI, DeepSeek e Anthropic. Não foi encontrado modo documentado de inferência local, VLM offline ou extração jurídica no README, no script ou no pacote de preflight.
- Nenhuma conexão ou autenticação no DGX foi tentada; acesso, conta, GPU e ambiente remoto permanecem não verificados.

## Menor demonstração possível hoje e próximos passos

O entregável verificável já pronto é este preflight: método, entradas fixadas, log e integridade dos arquivos. Para apresentar **imagem → premissa → formalização jurídica** sem pagamento, a alternativa imediata é selecionar uma imagem jurídica autorizada, anotar manualmente a premissa visível e a inferência jurídica, e aplicar o perfil formal/auditoria pertinente sobre esse caso. Isso é uma **proposta de caso humano anotado**, ainda não executada por esta tarefa; não deve ser apresentada como extração automática ou avaliação de modelo.

A próxima experiência automática jurídica depende de corpus/recorte confirmado e de implementação/ambiente de inferência local ou de autorização explícita para chamadas externas. Este teste aproveita a infraestrutura de verificação existente, sem demonstrar essa extensão.

## Evidências e reprodução

- `run.log`: saída integral e imutável do comando.
- `run.json`: horário UTC, ambiente, comando, commit, códigos de saída, contagens e hashes dos artefatos.
- `inputs-before.sha256` e `inputs-after.sha256`: inventários SHA-256 da cópia; idênticos.
- `tracked-files.txt`: inventário dos arquivos do commit.
- `check_cv.py` e `LEIA-ME.md`: cópias do pacote auditado.
- `record_preflight.py`: capturador local; recusa substituir um checkout existente.
- `tracked-snapshot.tar` e `checkout/`: cópia integral local para reprodução, mantida no workspace e excluída do ZIP leve de evidências.

SHA-256 do verificador: `1e29fe63a1150e349a2e57f94884b3b1063a2576cb1535b2426ecebc8a5d6c9d`.

SHA-256 do pacote original: `9b33b816e854001444b2e81767681d176869249c329fa53cf59c9a22f0895824`.

Para repetir o teste sobre a cópia preservada, use o comando acima. SDKs ausentes podem continuar produzindo retorno global 1 mesmo com `[VALIDAÇÃO / OK]`. Não execute `main.py` nem `validation.py` sem `--dry-run` para esta reprodução.
