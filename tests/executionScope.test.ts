import { expect, test } from 'bun:test';
import { parseExecutionScope } from '../src/utils/executionScope';

test('accepts only the three explicit execution scopes', () => {
  for (const value of ['all', 'case01', 'federal_forms'] as const) {
    expect(parseExecutionScope(value)).toBe(value);
  }
  for (const value of [undefined, null, '', 'ALL', 'unknown', 1]) {
    expect(parseExecutionScope(value)).toBeNull();
  }
});
