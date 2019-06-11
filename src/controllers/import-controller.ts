import { NextFunction, Request, Response, Router } from 'express';
import { createExcelWorkBook } from '../services/import/excel-helper';

export default class ImportController {
  private router: Router;

  public init(): Router {
    this.router = Router();

    this.router.get('/template', this.getImportTemplate);
    return this.router;
  }

  private setHeaders = (res: Response): void => {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Observations.xlsx');
  };

  private getImportTemplate = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workBook = await createExcelWorkBook('template');
      this.setHeaders(res);
      await workBook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  };
}
