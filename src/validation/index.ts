import { checkSchema, validationResult, ValidationParamSchema } from 'express-validator/check';
import { NextFunction, Request, Response } from 'express';

const checkValidationStatus = (req: Request, res: Response, next: NextFunction): void => {
  if (validationResult(req).array().length) {
    res.status(400).send(validationResult(req).array());
  } else {
    next();
  }
};

const validateSchema = (schema: Record<string, ValidationParamSchema>) => {
  return [checkSchema(schema), checkValidationStatus];
};

export { validateSchema };
