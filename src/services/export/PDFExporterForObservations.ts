import path from 'path';
import { NextFunction, Request, Response } from 'express';
// import { getRepository, Repository } from 'typeorm';
import AbstractExporter, { ExporterType } from './AbstractExporter';
// import { Observation } from '../../entities/observation-entity';

export default class PDFExporterForObservations extends AbstractExporter<any> {
  public type: ExporterType = ExporterType.pdf;

  public route: string = 'observations';

  // private observations: Repository<Observation> = getRepository(Observation);

  // @ts-ignore FIXME
  public async export(_req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      res.sendFile(path.resolve(__dirname, './E2000PLUSExchangeCodeV117.pdf'));
    } catch (e) {
      next(e);
    }
  }
}
