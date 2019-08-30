import AbstractImporter, { ImporterType, XlsImporterType } from './AbstractImporter';
import { MulterOptions } from '../../controllers/upload-files-controller';
import { CustomError } from '../../utils/CustomError';

export default class XLSImporterForObservations extends AbstractImporter<Express.Multer.File, void> {
  public type: ImporterType = XlsImporterType.xls;

  public route: string = 'observations';

  public options: MulterOptions = {
    extensions: ['.xls', '.xlsx'],
    any: true,
  };

  public async import(files: Express.Multer.File[]): Promise<void> {
    this.filterFiles(files);
    throw new CustomError('Not implemented.', 522);
  }
}
