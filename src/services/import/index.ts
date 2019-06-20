import { NextFunction, Request, Response } from 'express';
import AbstractImporter, { ImporterType } from './AbstractImporter';
import EURINGImporterForObservations from './EURINGImporterForObservations';
import XLSImporterForObservations from './XLSImporterForObservations';
import XLSImporterValidateObservations from './excel/XLSImporterValidateObservations';
import { CustomError } from '../../utils/CustomError';
import { upload } from '../../controllers/upload-files-controller';

export default class Importer {
  private exporters: AbstractImporter[];

  public constructor() {
    this.exporters = [
      new EURINGImporterForObservations(),
      new XLSImporterForObservations(),
      new XLSImporterValidateObservations(),
    ];
  }

  private getImporter(route: string, type: ImporterType): AbstractImporter | undefined {
    /* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
    return this.exporters.find(e => e.type === type.toUpperCase() && e.route === route);
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
  public handle = (route: string) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.params;
      const importer = this.getImporter(route, type);
      if (!importer) {
        throw new CustomError(`Type ${type} isn't supported import type for ${route}`, 400);
      }
      upload(importer.options)(
        req,
        res,
        async (error: Error): Promise<void> => {
          if (error) {
            next(error);
          } else {
            await importer.import(req, res, next);
          }
        },
      );
    } catch (e) {
      next(e);
    }
  };
}
