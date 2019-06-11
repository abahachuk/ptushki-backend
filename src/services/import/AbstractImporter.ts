import { NextFunction, Request, Response } from 'express';

export type ImporterType = 'EURING' | 'XLS';

export default abstract class AbstractImporter {
  abstract type: ImporterType;

  abstract route: string;

  public abstract async import(req: Request, res: Response, next: NextFunction): Promise<void>;
}
