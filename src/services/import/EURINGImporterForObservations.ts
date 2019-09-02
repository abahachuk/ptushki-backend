import { NextFunction, Request, Response } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractImporter, { ImporterType } from './AbstractImporter';
import { Observation } from '../../entities/observation-entity';
import { Ring } from '../../entities/ring-entity';
import { MulterOptions } from '../../controllers/upload-files-controller';
import { CustomError } from '../../utils/CustomError';

export default class EURINGImporterForObservations extends AbstractImporter {
  public type: ImporterType = 'EURING';

  public route: string = 'observations';

  public options: MulterOptions = {
    extensions: [],
    any: false,
  };

  private observations: Repository<Observation> = getRepository(Observation);

  private rings: Repository<Ring> = getRepository(Ring);

  /* eslint-disable-next-line class-methods-use-this */
  public async import(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let observations: any[] = req.body;
      observations = observations.map(async (code: string) => {
        const observation = new Observation();
        const data = observation.importEURING(code);
        const ring = await this.rings.findOne({ identificationNumber: data.ringMentioned });
        return Object.assign(data, { ring: ring ? ring.id : null, finder: req.user.id });
      });
      const syncObservations = await Promise.all(observations);
      await this.validate(syncObservations);
      const result = await this.observations.save(syncObservations);
      res.json(result);
    } catch (e) {
      if (e.name === 'QueryFailedError') {
        next(new CustomError<string>(e.detail, 500));
      } else {
        next(e);
      }
    }
  }
}
