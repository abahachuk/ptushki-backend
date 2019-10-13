import { getRepository, Repository } from 'typeorm';
import AbstractImporter, { ImporterType, ImportInput } from './AbstractImporter';
import { Observation } from '../../entities/observation-entity';
import { Ring } from '../../entities/ring-entity';
import { MulterOptions } from '../../controllers/upload-files-controller';
import { CustomError } from '../../utils/CustomError';

export default class EURINGImporterForObservations extends AbstractImporter<ImportInput<string>, void> {
  public type: ImporterType = ImporterType.euring;

  public route: string = 'observations';

  public options: MulterOptions = {
    extensions: [],
    any: false,
  };

  private observations: Repository<Observation> = getRepository(Observation);

  private rings: Repository<Ring> = getRepository(Ring);

  public async import({ sources, userId }: ImportInput<string>): Promise<void> {
    try {
      const observations = sources.map(async (code: string) => {
        const observation = new Observation();
        const data = observation.importEURING(code);
        const ring = await this.rings.findOne({ identificationNumber: data.ringMentioned });
        return Object.assign(data, { ring: ring ? ring.id : null, finder: userId });
      });
      const syncObservations = await Promise.all(observations);
      await this.validate(syncObservations);
      await this.observations.save(syncObservations);
    } catch (e) {
      if (e.name === 'QueryFailedError') {
        throw new CustomError(e.detail, 500);
      } else {
        throw e;
      }
    }
  }
}
