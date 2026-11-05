from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_EVIDENCE_ROOTS = [
    ROOT / 'README.md',
    ROOT / '05-resultados',
    ROOT / '07-apresentacoes',
    ROOT / 'public',
    ROOT / 'src',
]
PROHIBITED = (
    'run-2026-10-27b-gemma-4-31b-it',
    'piloto empírico executado',
    '100% de abstenção',
    'bateria experimental executada',
    'execução experimental homologada',
    'bateria completa executada sob isolamento estrito',
    'PEND01',
    'PEND02',
)


class PublicEvidenceTests(unittest.TestCase):
    def test_public_material_has_no_unsupported_result_claims(self):
        violations = []
        for root in PUBLIC_EVIDENCE_ROOTS:
            paths = [root] if root.is_file() else [path for path in root.rglob('*') if path.is_file()]
            for path in paths:
                try:
                    text = path.read_text(encoding='utf-8')
                except (UnicodeDecodeError, OSError):
                    continue
                for phrase in PROHIBITED:
                    if phrase.casefold() in text.casefold():
                        violations.append(f'{path.relative_to(ROOT)}: {phrase}')
        self.assertEqual(violations, [], '\n'.join(violations))


if __name__ == '__main__':
    unittest.main(verbosity=2)
