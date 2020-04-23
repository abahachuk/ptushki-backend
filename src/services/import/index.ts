import AbstractImporter, { ImporterType, ImportInput, ImportOutput } from './AbstractImporter';
import EURINGImporterForObservations from './EURINGImporterForObservations';
import XLSImporterForObservations, { ImportWorksheetObservationXLSDto } from './XLSImporterForObservations';
import { CustomError } from '../../utils/CustomError';

export default class Importer {
  private exporters: AbstractImporter[];

  private readonly route: string;

  public constructor(route: string) {
    this.route = route;
    this.exporters = [new EURINGImporterForObservations(), new XLSImporterForObservations()];
  }

  private getImporter(type: ImporterType): AbstractImporter | undefined {
    return this.exporters.find(e => e.type === type.toUpperCase() && e.route === this.route);
  }

  // eslint can't handle method overload
  /* eslint-disable no-dupe-class-members, lines-between-class-members */
  public async handle(
    type: ImporterType.xls,
    sources: ImportInput<Express.Multer.File>,
  ): Promise<ImportWorksheetObservationXLSDto>;
  public async handle(type: ImporterType.euring, sources: ImportInput<string>): Promise<void>;
  public async handle(type: ImporterType, sources: ImportInput): Promise<ImportOutput> {
    const importer = this.getImporter(type);
    if (!importer) {
      throw new CustomError(`Type ${type} isn't supported import type for ${this.route}`, 400);
    }
    return importer.import(sources);
  }
  /* eslint-enable no-dupe-class-members, lines-between-class-members */
}
