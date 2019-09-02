import { NextFunction, Request, Response } from 'express';
import { Validator } from 'class-validator';
import { rowIdsError } from '../../validation/validation-messages';
import { CustomError } from '../../utils/CustomError';

const validator = new Validator();

export type ExporterType = 'EURING' | 'PDF' | 'XLS' | 'TEMPLATE';

export default abstract class AbstractExporter {
  abstract type: ExporterType;

  abstract route: string;

  public abstract async export(req: Request, res: Response, next: NextFunction): Promise<void>;

  // eslint-disable-next-line class-methods-use-this
  protected validateRowIds(rowIds: string[]) {
    if (!validator.isArray(rowIds) || !validator.arrayNotEmpty(rowIds) || rowIds.some(el => !validator.isUUID(el))) {
      throw new CustomError<string>(rowIdsError, 400);
    }
  }
}
