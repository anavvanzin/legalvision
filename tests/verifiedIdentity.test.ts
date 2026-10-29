import { expect, test } from 'bun:test';
import { hasVerifiedEmail } from '../src/middleware/verifiedIdentity';

test('accepts only an explicitly verified email identity', () => {
  expect(hasVerifiedEmail({ email_verified: true })).toBe(true);
  for (const value of [false, undefined, null, 'true']) {
    expect(hasVerifiedEmail({ email_verified: value })).toBe(false);
  }
});
