import AbstractExporter, { ExporterType, ExportOutput } from './AbstractExporter';
import EURINGExporterForObservations from './EURINGExporterForObservations';
import PDFExporterForObservations from './PDFExporterForObservations';
import XLSExporterForObservations from './XLSExporterForObservations';
import XLSTemplateExporterForObservations from './XLSTemplateExporterForObservations';

import { CustomError } from '../../utils/CustomError';

export default class Exporter {
  private exporters: AbstractExporter[];

  private route: string;

  public constructor(route: string) {
    this.route = route;

    this.exporters = [
      new EURINGExporterForObservations(),
      // @ts-ignore FIXME while implementing pdf export
      new PDFExporterForObservations(),
      new XLSExporterForObservations(),
      new XLSTemplateExporterForObservations(),
    ];
  }

  private getExporter(type: ExporterType): AbstractExporter | undefined {
    return this.exporters.find(e => e.type === type.toUpperCase() && e.route === this.route);
  }

  // eslint can't handle method overload
  /* eslint-disable no-dupe-class-members, lines-between-class-members */
  public async handle(type: ExporterType.xls, ids: string[], lang?: string): Promise<Buffer>;
  public async handle(type: ExporterType.template): Promise<Buffer>;
  public async handle(type: ExporterType.euring, ids: string[]): Promise<string[]>;
  public async handle(type: ExporterType, ids?: string[], lang?: string): Promise<ExportOutput> {
    const exporter = this.getExporter(type);
    if (!exporter) {
      throw new CustomError(`Type ${type} isn't supported export type for ${this.route}`, 400);
    }
    return exporter.export(ids, lang);
  }
  /* eslint-enable no-dupe-class-members, lines-between-class-members */
}
