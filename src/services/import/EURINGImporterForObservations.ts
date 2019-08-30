import { getRepository, Repository } from 'typeorm';
import AbstractImporter, { ImporterType, StringImporterType } from './AbstractImporter';
import { Observation } from '../../entities/observation-entity';
import { Ring } from '../../entities/ring-entity';
import { MulterOptions } from '../../controllers/upload-files-controller';
import { CustomError } from '../../utils/CustomError';

export default class EURINGImporterForObservations extends AbstractImporter<string, void> {
  public type: ImporterType = StringImporterType.euring;

  public route: string = 'observations';

  public options: MulterOptions = {
    extensions: [],
    any: false,
  };

  private observations: Repository<Observation> = getRepository(Observation);

  private rings: Repository<Ring> = getRepository(Ring);

  /* eslint-disable-next-line class-methods-use-this */
  public async import(codes: string[]): Promise<void> {
    try {
      const observations = codes.map(async (code: string) => {
        const observation = new Observation();
        const data = observation.importEURING(code);
        const ring = await this.rings.findOne({ identificationNumber: data.ringMentioned });
        return Object.assign(data, { ring: ring ? ring.id : null, finder: req.user.id });
      });
      const syncObservations = await Promise.all(observations);
      await this.validate(syncObservations);
      await this.observations.save(syncObservations);
    } catch (e) {
      if (e.name === 'QueryFailedError') {
        throw new CustomError(e.detail, 500));
      } else {
        throw e;
      }
    }
  }
}
