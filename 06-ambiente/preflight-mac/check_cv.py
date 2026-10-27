#!/usr/bin/env python3
"""Read-only preflight for the inspected Grupo 26 repository; Python stdlib only."""
import argparse
import csv
import hashlib
import importlib.metadata as md
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys

COMMIT = 'd374ac21ca0645c4a49e8ad719a1845afe8754f7'
VALIDATION_BLOB = 'ec3de301f0090d628c5ed99d9bb07da655a1c21d'
CLASSES = ('class1', 'class2', 'class3')

# Only the exact inspected validation source is allowed. -I excludes checkout
# imports, user site and PYTHONPATH; -B prevents bytecode writes. Environment
# is replaced, not filtered. The hook is defense in depth, not a general sandbox.
RUNNER = r'''
import sys, os, csv, json, re, argparse, dataclasses, pathlib, hashlib
from pathlib import Path
p = Path(sys.argv[1])
source = p.read_bytes()
blob = hashlib.sha1(b'blob ' + str(len(source)).encode() + b'\0' + source).hexdigest()
if blob != sys.argv[2]:
    raise SystemExit('SAFETY: validation.py changed; execution refused')
def guard(event, args):
    if event.startswith(('socket.', 'subprocess.', 'os.exec', 'os.spawn')) or event in (
        'os.system', 'os.remove', 'os.rmdir', 'os.rename', 'os.mkdir',
        'os.link', 'os.symlink', 'os.truncate', 'os.chmod', 'os.chown', 'os.utime'):
        raise PermissionError('SAFETY: blocked ' + event)
    if event == 'open':
        _, mode, flags = args
        if (isinstance(mode, str) and any(c in mode for c in 'wax+')) or (
            isinstance(flags, int) and flags & (os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND)):
            raise PermissionError('SAFETY: write blocked')
sys.addaudithook(guard)
sys.argv = [str(p), '--dry-run']
namespace = {'__name__': '__main__', '__file__': str(p)}
exec(compile(source, str(p), 'exec'), namespace)
'''


def emit(category, status, message):
    print('[{} / {}] {}'.format(category, status, message), flush=True)


def dgx():
    emit('DGX', 'LOCAL', 'ssh disponível: ' + str(bool(shutil.which('ssh'))))
    print('Não conecta, não lê chaves SSH, não pede senha e não verifica GPU local.')
    questions = (
        'A equipe/professor confirmou explicitamente sua autorização para a DGX?',
        'Você recebeu o endereço oficial de Jupyter/SSH e o método de autenticação?',
        'Seu IdUFSC/conta exigida está ativo e você conseguiu autenticar no serviço correto?',
        'A equipe confirmou a necessidade ou dispensa de VPN e você atende essa condição?',
        'Sua sessão/recursos foram liberados e você abriu um notebook/kernel remoto?',
    )
    pending = 0
    for question in questions:
        try:
            answer = input(question + ' [s/n/?]: ').strip().lower()
        except EOFError:
            answer = '?'
        if answer not in ('s', 'sim'):
            pending += 1
    emit('DGX', 'PENDENTE' if pending else 'DECLARADO',
         '{} pré-requisito(s) pendente(s)/desconhecido(s). Respostas são autodeclarações, não um teste remoto.'.format(pending))
    return 8 if pending else 0


def check(repo):
    code = 0
    emit('INSTALAÇÃO', 'INFO', '{}; {}; {}'.format(sys.version.split()[0], platform.machine(), sys.executable))
    if sys.version_info < (3, 10):
        emit('INSTALAÇÃO', 'FALHA', 'Python >= 3.10 necessário.')
        return 1
    emit('INSTALAÇÃO', 'INFO', 'venv ativo: ' + str(sys.prefix != sys.base_prefix))
    req = repo / 'requirements.txt'
    if req.is_file():
        names = [x.strip() for x in req.read_text().splitlines() if x.strip() and not x.lstrip().startswith('#')]
        if sorted(names) != ['anthropic', 'openai']:
            emit('SEGURANÇA', 'FALHA', 'requirements mudou; revisar manualmente antes de instalar.')
            code |= 16
        for name in ('openai', 'anthropic'):
            try:
                dist = md.distribution(name)
                emit('INSTALAÇÃO', 'OK', name + ' ' + dist.version)
                # Check active, non-extra dependency constraints without importing SDKs.
                try:
                    from packaging.requirements import Requirement
                except ImportError:
                    emit('INSTALAÇÃO', 'AVISO', 'packaging ausente; execute python3 -m pip check para verificar dependências transitivas.')
                    continue
                for line in dist.requires or []:
                    dependency = Requirement(line)
                    if dependency.marker and not dependency.marker.evaluate({'extra': ''}):
                        continue
                    try:
                        version = md.version(dependency.name)
                        if dependency.specifier and version not in dependency.specifier:
                            raise ValueError('versão incompatível')
                    except (md.PackageNotFoundError, ValueError):
                        emit('INSTALAÇÃO', 'FALHA', '{} requer {}'.format(name, dependency))
                        code |= 1
            except md.PackageNotFoundError:
                emit('INSTALAÇÃO', 'FALHA', name + ' ausente (não bloqueia dry-run).')
                code |= 1
    else:
        emit('ARQUIVOS', 'AUSENTE', 'requirements.txt')
        code |= 2
    def required(relative):
        nonlocal code
        p = repo / relative
        if not p.is_file():
            emit('ARQUIVOS', 'AUSENTE', relative)
            code |= 2
            return False
        return True
    for relative in ('README.md', 'main.py', 'statistics.py', 'all_examples.txt', 'validation.py'):
        required(relative)
    tests = repo / 'tests'
    if tests.is_dir() and {p.name for p in tests.glob('*.tsv')} != {c + '.tsv' for c in CLASSES}:
        emit('ARQUIVOS', 'FALHA', 'tests/ deve ter exatamente class1.tsv, class2.tsv, class3.tsv.')
        code |= 2
    for cls in CLASSES:
        required('expected_outputs/' + cls + '.txt')
        if required('tests/' + cls + '.tsv'):
            try:
                with (tests / (cls + '.tsv')).open(encoding='utf-8-sig', newline='') as f:
                    rows = list(csv.reader(f, delimiter='\t', strict=True))
                if not rows or any(len(row) != 2 for row in rows):
                    raise ValueError('esperados registros com dois campos, sem cabeçalho')
                expected = repo / 'expected_outputs' / (cls + '.txt')
                if expected.is_file() and len(expected.read_text(encoding='utf-8-sig').splitlines()) != len(rows):
                    raise ValueError('contagem TSV difere dos expected outputs')
                for i in range(1, len(rows) + 1):
                    relative = 'images/{}/test{}.png'.format(cls, i)
                    if required(relative):
                        with (repo / relative).open('rb') as image:
                            if image.read(8) != b'\x89PNG\r\n\x1a\n':
                                raise ValueError(relative + ': assinatura PNG inválida/LFS não materializado')
                emit('ARQUIVOS', 'INFO', '{}: {} casos; imagens verificadas por presença/assinatura, sem decodificação.'.format(cls, len(rows)))
            except (OSError, UnicodeError, csv.Error, ValueError) as exc:
                emit('ARQUIVOS', 'FALHA', '{}: {}'.format(cls, exc))
                code |= 2
    results = repo / 'results'
    models = sorted(p for p in results.iterdir() if p.is_dir() and not p.name.startswith('.')) if results.is_dir() else []
    if not models:
        emit('ARQUIVOS', 'AUSENTE', 'results/ sem diretórios de modelos; obtenha os resultados existentes, não regenere.')
        code |= 2
    for model in models:
        for cls in CLASSES:
            required('results/{}/{}.txt'.format(model.name, cls))
    if not (repo / 'validation').exists():
        emit('ARQUIVOS', 'INFO', 'validation/ ausente é permitido; nenhuma avaliação salva será verificada.')
    source = repo / 'validation.py'
    if not source.is_file():
        emit('VALIDAÇÃO', 'BLOQUEADA', 'validation.py ausente.')
        return code | 2
    data = source.read_bytes()
    blob = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
    if blob != VALIDATION_BLOB:
        emit('SEGURANÇA', 'FALHA', 'validation.py não corresponde à versão inspecionada; dry-run recusado.')
        return code | 16
    emit('VALIDAÇÃO', 'INFO', 'Executando validation.py --dry-run; ambiente sem credenciais, rede/gravação bloqueadas.')
    try:
        result = subprocess.run([sys.executable, '-I', '-B', '-c', RUNNER, str(source), VALIDATION_BLOB],
                                cwd=str(repo), env={'PATH': os.defpath}, capture_output=True, text=True, timeout=60)
        if result.stdout:
            print(result.stdout.rstrip())
        if result.stderr:
            print(result.stderr.rstrip())
        if result.returncode:
            emit('VALIDAÇÃO', 'FALHA', 'Inputs/avaliações salvas inconsistentes ou erro de execução; veja mensagem acima.')
            code |= 4
        else:
            emit('VALIDAÇÃO', 'OK', 'Dry-run aprovado. Não atesta qualidade semântica, acesso DGX ou execução de modelos.')
    except subprocess.TimeoutExpired:
        emit('VALIDAÇÃO', 'FALHA', 'Tempo excedido (60 s).')
        code |= 4
    return code


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, help='checkout isolado; somente leitura')
    parser.add_argument('--dgx', action='store_true', help='checklist independente, sem conexão/credenciais')
    args = parser.parse_args()
    if args.dgx:
        return dgx()
    if args.repo is None:
        parser.error('informe --repo ou --dgx')
    repo = args.repo.resolve()
    if not repo.is_dir():
        emit('ARQUIVOS', 'AUSENTE', str(repo))
        return 2
    try:
        return check(repo)
    except (OSError, UnicodeError, ValueError) as exc:
        emit('ARQUIVOS', 'FALHA', str(exc))
        return 2


if __name__ == '__main__':
    sys.exit(main())
