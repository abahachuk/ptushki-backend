import { getRepository, Repository } from 'typeorm';
import { Ring } from '../../entities/ring-entity';
import AbstractExporter, { ExporterType } from './AbstractExporter';
import EURINGSingleEntityExporter from './EURINGSingleEntityExporter';

export default class EURINGExporterForObservation extends AbstractExporter<string[]> {
  public type: ExporterType = ExporterType.euring;

  public route: string = 'rings-by';

  private rings: Repository<Ring> = getRepository(Ring);

  public async export(rowIds: string[]): Promise<string[]> {
    this.validateRowIds(rowIds);
    const rings: Ring[] = await this.rings.find({
      where: rowIds.map(id => ({ id })),
    });
    return rings.map(e => EURINGSingleEntityExporter.export(e));
  }
}
