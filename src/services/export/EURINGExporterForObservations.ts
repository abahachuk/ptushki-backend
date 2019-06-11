import { getRepository, Repository } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { AbleToExportAndImportEuring } from '../../entities/common-interfaces';
import { Observation } from '../../entities/observation-entity';
import AbstractExporter, { ExporterType } from './AbstractExporter';

export default class EURINGExporterForObservation extends AbstractExporter {
  public type: ExporterType = 'EURING';

  public route: string = 'observations';

  private observations: Repository<Observation> = getRepository(Observation);

  /* eslint-disable-next-line class-methods-use-this */
  public async export(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ids = req.body;
      const observations: AbleToExportAndImportEuring[] = await this.observations
        .createQueryBuilder('obs')
        .where('obs.id IN (:...ids)', { ids })
        .getMany();
      res.json(observations.map(e => e.exportEURING()));
    } catch (e) {
      next(e);
    }
  }
}
