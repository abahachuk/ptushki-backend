import { NextFunction, Request, Response } from 'express';
// import { getRepository, Repository } from 'typeorm';
import AbstractExporter, { ExporterType } from './AbstractExporter';
// import { Observation } from '../../entities/observation-entity';

export default class PDFExporterForObservations extends AbstractExporter {
  public type: ExporterType = 'PDF';

  public route: string = 'observations';

  // private observations: Repository<Observation> = getRepository(Observation);

  /* eslint-disable-next-line class-methods-use-this */
  public async export(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.sendFile('./E2000PLUSExchangeCodeV117.pdf');
    } catch (e) {
      next(e);
    }
  }
}
