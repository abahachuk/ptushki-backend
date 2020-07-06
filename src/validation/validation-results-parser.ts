import { ValidationError } from 'class-validator';

export interface ParsedValidationsErrors {
  [key: string]: string[];
}

export const parseValidationErrors = (errors: ValidationError[]) =>
  errors.reduce(
    (acc: ParsedValidationsErrors, error: ValidationError): ParsedValidationsErrors => ({
      ...acc,
      [error.property]: Object.values(error.constraints),
    }),
    {},
  );
