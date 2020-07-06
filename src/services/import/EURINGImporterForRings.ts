import { getRepository, Repository } from 'typeorm';
import AbstractImporter, { ImporterType, ImportInput } from './AbstractImporter';
import { Ring } from '../../entities/ring-entity';
import { MulterOptions } from '../../controllers/upload-files-controller';
import { CustomError } from '../../utils/CustomError';

export default class EURINGImporterForRings extends AbstractImporter<ImportInput<string>, void> {
  public type: ImporterType = ImporterType.euring;

  public route: string = 'rings-by';

  public options: MulterOptions = {
    extensions: [],
    any: false,
  };

  private rings: Repository<Ring> = getRepository(Ring);

  public async import({ sources, userId }: ImportInput<string>): Promise<void> {
    try {
      const rings = sources.map((code: string) => {
        const ring = new Ring();
        const data = ring.importEURING(code);
        return Object.assign(data, { ringer: userId });
      });
      await this.validate(rings);
      await this.rings.save(rings);
    } catch (e) {
      if (e.name === 'QueryFailedError') {
        throw new CustomError(e.detail, 500);
      } else {
        throw e;
      }
    }
  }
}
