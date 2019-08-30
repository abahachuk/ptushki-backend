import AbstractImporter, {
  ImporterType,
  ImportInput,
  ImportOutput,
  StringImporterType,
  XlsImporterType,
} from './AbstractImporter';
import EURINGImporterForObservations from './EURINGImporterForObservations';
import XLSImporterForObservations from './XLSImporterForObservations';
import XLSImporterValidateObservations from './excel/XLSImporterValidateObservations';
import { CustomError } from '../../utils/CustomError';
import { DataCheckDto } from './excel/helper';

export default class Importer {
  private exporters: AbstractImporter[];

  private route: string;

  public constructor(route: string) {
    this.route = route;
    this.exporters = [
      new EURINGImporterForObservations(),
      new XLSImporterForObservations(),
      new XLSImporterValidateObservations(),
    ];
  }

  private getImporter(type: ImporterType): AbstractImporter | undefined {
    return this.exporters.find(e => e.type === type.toUpperCase() && e.route === this.route);
  }

  // eslint can't handle method overload
  /* eslint-disable no-dupe-class-members, lines-between-class-members */
  public async handle(type: XlsImporterType.xls, sources: Express.Multer.File[]): Promise<void>;
  public async handle(type: XlsImporterType.validate, sources: Express.Multer.File[]): Promise<DataCheckDto>;
  public async handle(type: StringImporterType.euring, sources: string[]): Promise<void>;
  public async handle(type: ImporterType, sources: ImportInput[]): Promise<ImportOutput> {
    const importer = this.getImporter(type);
    if (!importer) {
      throw new CustomError(`Type ${type} isn't supported import type for ${this.route}`, 400);
    }

    return importer.import(sources);
  }
  /* eslint-enable no-dupe-class-members, lines-between-class-members */
}
