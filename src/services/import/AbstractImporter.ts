import { NextFunction, Request, Response } from 'express';
import { validate, ValidationError } from 'class-validator';
import { MulterOptions } from '../../controllers/upload-files-controller';
import { CustomError } from '../../utils/CustomError';

export type ImporterType = 'EURING' | 'XLS' | 'VALIDATE-XLS';

interface ParsedErrors {
  [key: string]: string[];
}

export default abstract class AbstractImporter {
  abstract type: ImporterType;

  abstract route: string;

  abstract options: MulterOptions;

  public abstract async import(req: Request, res: Response, next: NextFunction): Promise<void>;

  /* eslint-disable */
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
