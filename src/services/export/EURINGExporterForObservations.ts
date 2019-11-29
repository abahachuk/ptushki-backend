import { getRepository, Repository } from 'typeorm';
import { AbleToExportAndImportEuring } from '../../entities/common-interfaces';
import { Observation } from '../../entities/observation-entity';
import AbstractExporter, { ExporterType } from './AbstractExporter';

export default class EURINGExporterForObservation extends AbstractExporter<string[]> {
  public type: ExporterType = ExporterType.euring;

  public route: string = 'observations';

  private observations: Repository<Observation> = getRepository(Observation);

  public async export(rowIds: string[]): Promise<string[]> {
    this.validateRowIds(rowIds);
    const observations: AbleToExportAndImportEuring[] = await this.observations.find({
      where: rowIds.map(id => ({ id })),
    });
    return observations.map(e => e.exportEURING());
  }
}
