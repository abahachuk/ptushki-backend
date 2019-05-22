import config from 'config';
import { Router, NextFunction, Request, Response } from 'express';
import { Repository } from 'typeorm';

// import { jsonToXlsx } from '../services/xlsx-service';

const UUID_LENGTH = config.get('UUID_LENGTH');

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

  protected setMainEntity(entity: Repository<any>, key?: string): void {
    this.entity = entity;
    if (key) {
      this.key = key;
    }
  }

  /**
   * TODO
   * -reuse find method of each controller
   * -get data depends on provided query
   * -convert data to xlsx and send buffer to client
   * -if file name provided(just for test purpose) will create xlsx file in folder
   */
  // protected exportToType(exportParams: any): void {
  //   const { findParams, parserConfig } = exportParams;
  //   const { type, ...config } = parserConfig;
  //   const data = this.entity.find(findParams);
  //
  //
  //   return jsonToXlsx(data, { fileName: 'lol.xlsx', sheetName: 'lol' });
  // }

  public abstract init(): Router;
}
