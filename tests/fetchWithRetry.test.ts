import { afterEach, expect, mock, test } from 'bun:test';
import { fetchWithRetry } from '../src/utils/fetchWithRetry';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const url = 'https://example.invalid/works?api_key=private-test-value';

test('returns a successful response without a retry', async () => {
  const response = new Response('ok');
  const fetchMock = mock(async () => response);
  globalThis.fetch = fetchMock as typeof fetch;
  expect(await fetchWithRetry(url)).toBe(response);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('never exposes request URL, credentials or upstream body on HTTP failure', async () => {
  globalThis.fetch = mock(async () => new Response('echo private-test-value', { status: 400 })) as typeof fetch;
  const error = await fetchWithRetry(url).catch((value: Error) => value);
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain('400');
  expect((error as Error).message).not.toContain('private-test-value');
  expect((error as Error).message).not.toContain('example.invalid');
  expect((error as Error).message).not.toContain('echo');
});

test('retries a transient failure and preserves the success', async () => {
  const response = new Response('ok');
  let calls = 0;
  globalThis.fetch = mock(async () => ++calls === 1 ? new Response('', { status: 503 }) : response) as typeof fetch;
  expect(await fetchWithRetry(url, {}, 1, 0)).toBe(response);
  expect(calls).toBe(2);
});

test('respects the retry ceiling on rate limits without leaking the URL', async () => {
  const fetchMock = mock(async () => new Response('private-test-value', { status: 429, headers: { 'Retry-After': '0.001' } }));
  globalThis.fetch = fetchMock as typeof fetch;
  await expect(fetchWithRetry(url, {}, 1, 0)).rejects.toThrow('HTTP 429');
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test('hides transport errors that may echo a credential-bearing URL', async () => {
  globalThis.fetch = mock(async () => { throw new Error('network failure ' + url); }) as typeof fetch;
  const error = await fetchWithRetry(url).catch((value: Error) => value);
  expect((error as Error).message).not.toContain('private-test-value');
  expect((error as Error).message).not.toContain('example.invalid');
});
