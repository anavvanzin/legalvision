import { afterEach, expect, mock, test } from 'bun:test';
import { requireModelExecution } from '../src/middleware/modelExecutionGate';
import type { Request, Response, NextFunction } from 'express';

const before = process.env.ALLOW_MODEL_EXECUTION;
afterEach(() => {
  if (before === undefined) delete process.env.ALLOW_MODEL_EXECUTION;
  else process.env.ALLOW_MODEL_EXECUTION = before;
});

function response() {
  const result = { status: mock((_code: number) => result), json: mock((_body: unknown) => result) };
  return result;
}

test('blocks model execution by default before calling the next middleware', () => {
  delete process.env.ALLOW_MODEL_EXECUTION;
  const res = response();
  const next = mock(() => {});
  requireModelExecution({} as Request, res as unknown as Response, next as NextFunction);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(next).not.toHaveBeenCalled();
});

test('accepts only an explicit true setting, never a truthy alternative', () => {
  for (const value of ['false', '1', 'TRUE', '']) {
    process.env.ALLOW_MODEL_EXECUTION = value;
    const res = response();
    const next = mock(() => {});
    requireModelExecution({} as Request, res as unknown as Response, next as NextFunction);
    expect(next).not.toHaveBeenCalled();
  }
});

test('passes to the separate authentication check only after an explicit setting', () => {
  process.env.ALLOW_MODEL_EXECUTION = 'true';
  const res = response();
  const next = mock(() => {});
  requireModelExecution({} as Request, res as unknown as Response, next as NextFunction);
  expect(next).toHaveBeenCalledTimes(1);
  expect(res.status).not.toHaveBeenCalled();
});
