import { NextFunction, Request, Response } from 'express';
import { MulterOptions } from '../../controllers/upload-files-controller';

export type ImporterType = 'EURING' | 'XLS' | 'VALIDATE-XLS';

export default abstract class AbstractImporter {
  abstract type: ImporterType;

  abstract route: string;

  abstract options: MulterOptions;

  public abstract async import(req: Request, res: Response, next: NextFunction): Promise<void>;
}
