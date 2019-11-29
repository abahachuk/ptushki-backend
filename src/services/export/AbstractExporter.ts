import { Validator } from 'class-validator';
import { rowIdsError } from '../../validation/validation-messages';
import { CustomError } from '../../utils/CustomError';

const validator = new Validator();

export enum ExporterType {
  xls = 'XLS',
  template = 'TEMPLATE',
  euring = 'EURING',
  pdf = 'PDF',
}

export type ExportOutput = Buffer | string[];

export default abstract class AbstractExporter<TExport extends ExportOutput = ExportOutput> {
  abstract type: ExporterType;

  abstract route: string;

  public abstract async export(ids?: string[], lang?: string): Promise<TExport>;

  protected validateRowIds(rowIds: string[]) {
    if (!validator.isArray(rowIds) || !validator.arrayNotEmpty(rowIds) || rowIds.some(el => !validator.isUUID(el))) {
      throw new CustomError(rowIdsError, 400);
    }
  }
}
