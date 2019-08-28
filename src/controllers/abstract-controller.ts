import config from 'config';
import { NextFunction, Request, Response } from 'express';
import { Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { CustomError } from '../utils/CustomError';

const UUID_LENGTH = config.get('UUID_LENGTH');

interface ParsedErrors {
  [key: string]: string[];
}

export default abstract class AbstractController {
  private entity: Repository<any>;

  private key: string;

  protected checkId = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.entity) {
        throw new CustomError('Before use checkId method, please specify used entity with setMainEntity method', 400);
      }

      const { id }: { id: string } = req.params;
      if (id.length !== UUID_LENGTH) {
        throw new CustomError(`Provided ${this.entity.metadata.name} identifier (${id}) is incorrect`, 400);
      }

      const instance = await this.entity.findOne(id);

      if (!instance) {
        throw new CustomError(`${this.entity.metadata.name} with ${id} not exists`, 404);
      }
      Object.assign(req, { [this.key || this.entity.metadata.tableName]: instance });
      next();
    } catch (e) {
      next(e);
    }
  };

  protected setMainEntity(entity: Repository<any>, key?: string) {
    this.entity = entity;
    if (key) {
      this.key = key;
    }
  }

  // Argument 'data' it is a new data, and argument existedData is optional and needed for refreshing existing data in db
  protected async validate(data: any, existedData: any = {}): Promise<void> {
    const createdModel = await this.entity.create(Object.assign(existedData, data));
    const errors = await validate(createdModel);
    if (errors.length) {
      const parsedErrors = errors.reduce(
        (acc: ParsedErrors, error: ValidationError): ParsedErrors => ({
          ...acc,
          [error.property]: Object.values(error.constraints),
        }),
        {},
      );
      throw new CustomError(parsedErrors as string, 422);
    }
  }
}
