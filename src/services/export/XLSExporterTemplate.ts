import { NextFunction, Request, Response } from 'express';
import AbstractExporter, { ExporterType } from './AbstractExporter';
import { createExcelWorkBook } from '../import/excel-helper';

export default class XLSExporterTemplate extends AbstractExporter {
  public type: ExporterType = 'TEMPLATE';

  public route: string = 'observations';

  private setHeaders = (res: Response): void => {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Observations.xlsx');
  };

  /* eslint-disable-next-line class-methods-use-this */
  public async export(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workBook = await createExcelWorkBook('template');
      this.setHeaders(res);
      await workBook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}
