import config from 'config';
import { Router, NextFunction, Request, Response } from 'express';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';

const UUID_LENGTH = config.get('UUID_LENGTH');

class ValidationError {
  public message: any;

  public status: number;

  public constructor(message: any, status: number) {
    this.message = message;
    this.status = status;
  }
}

export default abstract class AbstractController {
  private entity: Repository<any>;

  private key: string;

  protected checkId = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.entity) {
        throw new Error('Before use checkId method, please specify used entity with setMainEntity method');
      }

      const { id }: { id: string } = req.params;
      if (id.length !== UUID_LENGTH) {
        throw new Error(`Provided ${this.entity.metadata.name} identifier (${id}) is incorrect`);
      }

      const instance = await this.entity.findOne(id);

      if (!instance) {
        throw new Error(`${this.entity.metadata.name} with ${id} not exists`);
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
  protected async validate(data: any, existedData: any = {}) {
    const createdModel = await this.entity.create(Object.assign(existedData, data));
    const errors = await validate(createdModel);
    if (errors.length) {
      const parsedErrors = errors.reduce(
        (acc, error) => ({
          ...acc,
          [error.property]: Object.values(error.constraints),
        }),
        {},
      );
      throw new ValidationError(parsedErrors, 422);
    }
  }

  public abstract init(): Router;
}
