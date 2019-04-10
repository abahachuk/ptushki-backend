import config from 'config';
import { Router, NextFunction, Request, Response } from 'express';
import { Repository } from 'typeorm';

const UUID_LENGTH = config.get('UUID_LENGTH');

export default abstract class AbstractController {
  private entity: Repository<any>;

  protected checkId = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!this.entity) {
      next();
    }
    const { id }: { id: string } = req.params;
    try {
      if (id.length !== UUID_LENGTH) {
        throw new Error(`Provided ${this.entity.metadata.name} identifier (${id}) is incorrect`);
      }

      const instance = await this.entity.findOne(id);

      if (!instance) {
        throw new Error(`${this.entity.metadata.name} with ${id} not exists`);
      }
      Object.assign(req, { [this.entity.metadata.tableName]: instance });
      next();
    } catch (e) {
      next(e);
    }
  };

  protected setMainEntity(entity: Repository<any>) {
    this.entity = entity;
  }

  public abstract init(): Router;
}
