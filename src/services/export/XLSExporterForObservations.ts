import path from 'path';
import { NextFunction, Request, Response } from 'express';
// import { getRepository, Repository } from 'typeorm';
import AbstractExporter, { ExporterType } from './AbstractExporter';
// import { Observation } from '../../entities/observation-entity';

export default class XLSExporterForObservations extends AbstractExporter {
  public type: ExporterType = 'XLS';

  public route: string = 'observations';

  // private observations: Repository<Observation> = getRepository(Observation);

  /* eslint-disable-next-line class-methods-use-this */
  public async export(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.sendFile(path.resolve(__dirname, './sample.xls'));
    } catch (e) {
      next(e);
    }
  }
}
