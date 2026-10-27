#!/usr/bin/env python3
"""Remove only JPEG APP1 metadata; preserve image coding bytes and ICC profile."""
import argparse
import hashlib
import json
from pathlib import Path


def strip_app1(data):
    if data[:2] != b'\xff\xd8':
        raise ValueError('Not a JPEG')
    offset = 2
    out = bytearray(data[:2])
    removed = []
    while offset < len(data):
        start = offset
        if data[offset] != 255:
            raise ValueError('Invalid marker before first image scan')
        while data[offset] == 255:
            offset += 1
        marker = data[offset]
        offset += 1
        if marker in (0xD8, 0xD9, 0x01) or 0xD0 <= marker <= 0xD7:
            raise ValueError('Unexpected standalone marker before scan')
        length = int.from_bytes(data[offset:offset + 2], 'big')
        end = offset + length
        if length < 2 or end > len(data):
            raise ValueError('Invalid JPEG segment size')
        if marker == 0xDA:
            tail = data[start:]
            out.extend(tail)
            return bytes(out), removed, tail
        if marker == 0xE1:
            removed.append({'marker': 'APP1', 'segment_bytes': end - start})
        else:
            out.extend(data[start:end])
        offset = end
    raise ValueError('No SOS image scan')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists():
        raise ValueError('Refusing to overwrite an existing output')
    raw = args.source.read_bytes()
    sanitized, removed, tail = strip_app1(raw)
    checked, extra, sanitized_tail = strip_app1(sanitized)
    assert checked == sanitized and not extra
    assert tail == sanitized_tail
    assert b'Dutch bicycle' not in sanitized
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(sanitized)
    print(json.dumps({
        'source_sha256': hashlib.sha256(raw).hexdigest(),
        'output_sha256': hashlib.sha256(sanitized).hexdigest(),
        'source_bytes': len(raw), 'output_bytes': len(sanitized),
        'removed': removed,
        'compressed_scan_and_tail_identical': tail == sanitized_tail,
        'scan_and_tail_sha256': hashlib.sha256(tail).hexdigest(),
        'icc_and_all_non_app1_header_segments_preserved': True,
        'operation': 'Metadata removal only; no decoding, recompression or pixel edits.',
    }, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
