import { NextFunction, Request, Response } from 'express';
import AbstractImporter, { ImporterType } from './AbstractImporter';
import EURINGImporterForObservations from './EURINGImporterForObservations';
import XLSImporterForObservations from './XLSImporterForObservations';
import { CustomError } from '../../utils/CustomError';

export default class Importer {
  private exporters: AbstractImporter[];

  public constructor() {
    this.exporters = [new EURINGImporterForObservations(), new XLSImporterForObservations()];
  }

  private getImporter(route: string, type: ImporterType): AbstractImporter | undefined {
    return this.exporters.find(e => e.type === type.toUpperCase() && e.route === route);
  }

  public handle = (route: string) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.params;
      const importer = this.getImporter(route, type);
      if (!importer) {
        throw new CustomError(`Type ${type} isn't supported import type for ${route}`, 400);
      }
      await importer.import(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}
