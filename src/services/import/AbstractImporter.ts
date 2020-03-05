import path from 'path';
import { validate, ValidationError } from 'class-validator';
import { DataCheckDto } from '../excel-service/helper';
import { CustomError } from '../../utils/CustomError';

export interface MulterOptions {
  extensions: string[];
  any: boolean;
}

interface ParsedErrors {
  [key: string]: string[];
}

export enum ImporterType {
  xls = 'XLS',
  euring = 'EURING',
}

export interface ImportInput<T = Express.Multer.File | string> {
  sources: T[];
  userId?: string;
}
export type ImportOutput = void | DataCheckDto;

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
        const parsedErrors = errors.reduce(
          (acc: ParsedErrors, error: ValidationError): ParsedErrors => ({
            ...acc,
            [error.property]: Object.values(error.constraints),
          }),
          {},
        );
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
