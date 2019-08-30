import path from 'path';
import { validate, ValidationError } from 'class-validator';
import { DataCheckDto } from './excel/helper';
import { CustomError } from '../../utils/CustomError';

export interface MulterOptions {
  extensions: string[];
  any: boolean;
}

interface ParsedErrors {
  [key: string]: string[];
}

export enum XlsImporterType {
  xls = 'XLS',
  validate = 'VALIDATE-XLS',
}

export enum StringImporterType {
  euring = 'EURING',
}

export type ImporterType = XlsImporterType | StringImporterType;

export type ImportInput = Express.Multer.File | string;
export type ImportOutput = void | DataCheckDto;

export default abstract class AbstractImporter<
  TSource extends ImportInput = ImportInput,
  TReturn extends ImportOutput = ImportOutput
> {
  abstract type: ImporterType;

  abstract route: string;

  abstract options: MulterOptions;

  public abstract async import(sources: TSource[]): Promise<TReturn>;

  protected filterFiles(files: Express.Multer.File[]) {
    if (files.every(({ originalname }) => this.options.extensions.includes(path.extname(originalname)))) {
      return true;
    }
    throw new Error(`Incorrect file extension. It is possible to upload only: ${this.options.extensions.join(',')}`);
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
      throw new CustomError<any>(mapWithErrors, 422);
    }
  }
}
