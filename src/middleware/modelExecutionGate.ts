import type { Request, Response, NextFunction } from 'express';

export function requireModelExecution(_req: Request, res: Response, next: NextFunction): void {
  if (process.env.ALLOW_MODEL_EXECUTION !== 'true') {
    res.status(403).json({ error: 'Execução de modelos pausada. A preparação de dados continua disponível.' });
    return;
  }
  next();
}
