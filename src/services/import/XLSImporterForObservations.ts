import AbstractImporter, { ImporterType, ImportInput } from './AbstractImporter';
import { MulterOptions } from '../../controllers/upload-files-controller';
import { CustomError } from '../../utils/CustomError';

export default class XLSImporterForObservations extends AbstractImporter<ImportInput<Express.Multer.File>, void> {
  public type: ImporterType = ImporterType.xls;

  public route: string = 'observations';

  public options: MulterOptions = {
    extensions: ['.xls', '.xlsx'],
    any: true,
  };

  public async import({ sources }: ImportInput<Express.Multer.File>): Promise<void> {
    this.filterFiles(sources);
    throw new CustomError('Not implemented.', 522);
  }
}
