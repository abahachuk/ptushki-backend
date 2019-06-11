import { NextFunction, Request, Response } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractImporter, { ImporterType } from './AbstractImporter';
import { Observation } from '../../entities/observation-entity';

export default class XLSImporterForObservations extends AbstractImporter {
  public type: ImporterType = 'XLS';

  public route: string = 'observations';

  private observations: Repository<Observation> = getRepository(Observation);

  /* eslint-disable-next-line class-methods-use-this */
  public async import(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const observations: any[] = req.body;
      const result = await this.observations.insert(observations);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
}
