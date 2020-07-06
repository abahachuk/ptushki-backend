import AbstractExporter, { ExporterType } from './AbstractExporter';
import { createExcelWorkBook } from '../excel-service/helper';
import XLSImporterForRings from '../import/XLSImporterForRings';

export default class XLSTemplateExporterForRings extends AbstractExporter<Buffer> {
  public type: ExporterType = ExporterType.template;

  public route: string = 'rings-by';

  public async export(): Promise<Buffer> {
    const workBook = await createExcelWorkBook(XLSImporterForRings.expectedColumnHeaders);
    // @ts-ignore (empty Buffer type in exceljs overrides native)
    return workBook.xlsx.writeBuffer();
  }
}
