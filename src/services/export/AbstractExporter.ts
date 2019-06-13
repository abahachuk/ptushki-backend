import { NextFunction, Request, Response } from 'express';

export type ExporterType = 'EURING' | 'PDF' | 'XLS' | 'TEMPLATE';

export default abstract class AbstractExporter {
  abstract type: ExporterType;

  abstract route: string;

  public abstract async export(req: Request, res: Response, next: NextFunction): Promise<void>;
}
