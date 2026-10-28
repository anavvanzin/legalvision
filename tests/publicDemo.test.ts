import { expect, test } from 'bun:test';
import { isPublicDemo } from '../src/publicDemo';

test('enables public demo only for the exact true value', () => {
  expect(isPublicDemo('true')).toBe(true);
  for (const value of [undefined, '', 'false', '1', 'TRUE']) {
    expect(isPublicDemo(value)).toBe(false);
  }
});
