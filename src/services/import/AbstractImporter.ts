import path from 'path';
import { validate } from 'class-validator';
import { ImportWorksheetXLSDto } from '../import/XLSBaseImporter';
import { CustomError } from '../../utils/CustomError';
import { parseValidationErrors } from '../../validation/validation-results-parser';

export interface MulterOptions {
  extensions: string[];
  any: boolean;
}

export enum ImporterType {
  xls = 'XLS',
  euring = 'EURING',
}

export interface ImportInput<T = Express.Multer.File | string> {
  sources: T[];
  userId?: string;
}
export type ImportOutput = void | ImportWorksheetXLSDto;

export default abstract class AbstractImporter<
  TSource extends ImportInput = ImportInput,
  TReturn extends ImportOutput = ImportOutput
> {
  abstract type: ImporterType;

  abstract route: string;

  abstract options: MulterOptions;

  public abstract async import(sources: TSource): Promise<TReturn>;

  protected filterFiles(files: Express.Multer.File[]) {
    if (files.every(({ originalname: file }) => this.options.extensions.includes(path.extname(file)))) {
      return true;
    }
    throw new CustomError(
      `Incorrect file extension. It is possible to upload only: ${this.options.extensions.join(', ')}`,
      400,
    );
  }

  protected async validate(data: any[]): Promise<void> {
    const mapWithErrors = await data.reduce(async (accumulator, item, id): Promise<any> => {
      const errors = await validate(item);
      if (errors.length) {
        const parsedErrors = parseValidationErrors(errors);
        return {
          ...(await accumulator),
          [id]: parsedErrors,
        };
      }
      return accumulator;
    }, {});

    if (Object.keys(mapWithErrors).length) {
      throw new CustomError(mapWithErrors, 422);
    }
  }
}
