import { getRepository, Repository } from 'typeorm';
import { Ring } from '../../entities/ring-entity';
import AbstractExporter, { ExporterType } from './AbstractExporter';
import EURINGSingleEntityExporter from './EURINGSingleEntityExporter';

export default class EURINGExporterForRing extends AbstractExporter<string[]> {
  public type: ExporterType = ExporterType.euring;

  public route: string = 'rings-by';

  private rings: Repository<Ring> = getRepository(Ring);

  public async export(ids: string[]): Promise<string[]> {
    this.validateRowIds(ids);
    const rings: Ring[] = await this.rings.find({
      where: ids.map(id => ({ id })),
    });
    return rings.map(e => EURINGSingleEntityExporter.export(e));
  }
}
