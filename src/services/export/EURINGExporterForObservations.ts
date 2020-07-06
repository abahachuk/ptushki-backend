import { getRepository, Repository } from 'typeorm';
import { Observation } from '../../entities/observation-entity';
import AbstractExporter, { ExporterType } from './AbstractExporter';
import EURINGSingleEntityExporter from './EURINGSingleEntityExporter';

export default class EURINGExporterForObservation extends AbstractExporter<string[]> {
  public type: ExporterType = ExporterType.euring;

  public route: string = 'observations';

  private observations: Repository<Observation> = getRepository(Observation);

  public async export(ids: string[]): Promise<string[]> {
    this.validateRowIds(ids);
    const observations: Observation[] = await this.observations.find({
      where: ids.map(id => ({ id })),
    });
    return observations.map(e => EURINGSingleEntityExporter.export(e));
  }
}
