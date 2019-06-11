import { NextFunction, Request, Response } from 'express';
import AbstractExporter, { ExporterType } from './AbstractExporter';
import EURINGExporterForObservations from './EURINGExporterForObservations';
import PDFExporterForObservations from './PDFExporterForObservations';
import XLSExporterForObservations from './XLSExporterForObservations';
import { CustomError } from '../../utils/CustomError';

export default class Exporter {
  private exporters: AbstractExporter[];

  public constructor() {
    this.exporters = [
      new EURINGExporterForObservations(),
      new PDFExporterForObservations(),
      new XLSExporterForObservations(),
    ];
  }

  private getExporter(route: string, type: ExporterType): AbstractExporter | undefined {
    return this.exporters.find(e => e.type === type.toUpperCase() && e.route === route);
  }

  public handle = (route: string) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.params;
      const exporter = this.getExporter(route, type);
      if (!exporter) {
        throw new CustomError(`Type ${type} isn't supported export type for ${route}`, 400);
      }
      await exporter.export(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}
