export type LiveExecutionScope = 'all' | 'case01' | 'federal_forms';

export function parseExecutionScope(value: unknown): LiveExecutionScope | null {
  return value === 'all' || value === 'case01' || value === 'federal_forms' ? value : null;
}
