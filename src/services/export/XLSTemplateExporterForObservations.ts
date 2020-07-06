import AbstractExporter, { ExporterType } from './AbstractExporter';
import { createExcelWorkBook } from '../excel-service/helper';
import XLSImporterForObservations from '../import/XLSImporterForObservations';

export default class XLSTemplateExporterForObservations extends AbstractExporter<Buffer> {
  public type: ExporterType = ExporterType.template;

  public route: string = 'observations';

  public async export(): Promise<Buffer> {
    const workBook = await createExcelWorkBook(XLSImporterForObservations.expectedColumnHeaders);
    // @ts-ignore (empty Buffer type in exceljs overrides native)
    return workBook.xlsx.writeBuffer();
  }
}
