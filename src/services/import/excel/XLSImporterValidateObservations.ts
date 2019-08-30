import Excel, { Workbook } from 'exceljs';
import { getCustomRepository } from 'typeorm';
import {
  checkObservationImportedData,
  checkObservationsHeaderNames,
  DataCheck,
  DataCheckDto,
  EURingError,
  HeaderCheck,
  RawData,
  RowErorr,
  RowValidatedData,
} from './helper';
import { MulterOptions } from '../../../controllers/upload-files-controller';
import AbstractImporter, { ImporterType, XlsImporterType } from '../AbstractImporter';
import { CustomError } from '../../../utils/CustomError';
import { cachedEURINGCodes } from '../../../entities/euring-codes/cached-entities-fabric';
import { Age, PlaceCode, Sex, Species, Status } from '../../../entities/euring-codes';

export default class XLSImporterValidateObservations extends AbstractImporter<Express.Multer.File, DataCheckDto> {
  public type: ImporterType = XlsImporterType.validate;

  public route: string = 'observations';

  public options: MulterOptions = {
    extensions: ['.xls', '.xlsx'],
    any: true,
  };

  private checkEuRingCodes = async (excelData: DataCheck): Promise<void> => {
    try {
      const statusCached = await getCustomRepository(cachedEURINGCodes.CachedStatus).find();
      const speciesMentionedCached = await getCustomRepository(cachedEURINGCodes.CachedSpecies).find();
      const sexMentionedCached = await getCustomRepository(cachedEURINGCodes.CachedSex).find();
      const ageMentionedCached = await getCustomRepository(cachedEURINGCodes.CachedAge).find();
      const placeCodeCached = await getCustomRepository(cachedEURINGCodes.CachedPlaceCode).find();
      /* eslint-disable */
      for (const row of excelData.validFormatData) {
        const { data, rowNumber }: RowValidatedData = row;
        const { eu_statusCode, eu_species, eu_sexCode, eu_ageCode, eu_placeCode }: RawData = data;

        if (data) {
          const status = statusCached.filter(
            (statusRow: Status) => statusRow.id === eu_statusCode.toString().toUpperCase(),
          );
          const speciesMentioned = speciesMentionedCached.filter(
            (speciesRow: Species) => speciesRow.id === eu_species.toString(),
          );
          const sexMentioned = sexMentionedCached.filter(
            (sexRow: Sex) => sexRow.id === eu_sexCode.toString().toUpperCase(),
          );
          const ageMentioned = ageMentionedCached.filter(
            (ageRow: Age) => ageRow.id === eu_ageCode.toString().toUpperCase(),
          );
          const placeCode = placeCodeCached.filter(
            (placeCodeRow: PlaceCode) => placeCodeRow.id === eu_placeCode.toString().toUpperCase(),
          );

          const euCodeErrors: string[] = [];

          if (!status.length) {
            euCodeErrors.push('status');
          }
          if (!speciesMentioned.length) {
            euCodeErrors.push('species');
          }
          if (!sexMentioned.length) {
            euCodeErrors.push('sex');
          }
          if (!ageMentioned.length) {
            euCodeErrors.push('age');
          }
          if (!placeCode.length) {
            euCodeErrors.push('place code');
          }

          if (euCodeErrors.length) {
            const rowStatus: RowErorr = {
              verifiedEuRingCodes: false,
              error: `Can not find euRing codes: ${euCodeErrors.join(',')}`,
            };
            const error: EURingError = { rowNumber, status: rowStatus };

            excelData.euRingErrors.push(error);
          } else {
            excelData.addedData.push(row);
          }
        }
      }
    } catch (e) {
      throw new CustomError(e.message, 400);
    }
  };

  private checkPossibleClones = async (excelData: DataCheck): Promise<void> => {
    const map = new Map();
    try {
      for (const row of excelData.addedData) {
        const { data, rowNumber }: RowValidatedData = row;

        if (data) {
          map.set(JSON.stringify(data), rowNumber);
        }
      }
      excelData.possibleClones = excelData.addedData.length - map.size;
    } catch (e) {
      throw new CustomError(e.message, 400);
    }
  };

  private setXLSDataToObservation = async (excelData: DataCheck): Promise<void> => {
    const defaults = {
      manipulated: 'U',
      catchingMethod: 'U',
      catchingLures: 'U',
      accuracyOfDate: 9,
    };

    for (const row of excelData.addedData) {
      const rowData = {
        speciesMentioned: row.data.eu_species,
        sexMentioned: row.data.eu_sexCode.toString().toUpperCase(),
        ageMentioned: row.data.eu_ageCode.toString().toUpperCase(),
        date: row.data.date,
        longitude: row.data.longitude,
        latitude: row.data.latitude,
        status: row.data.eu_statusCode.toString().toUpperCase(),
        ringMentioned: row.data.ringNumber,
        colorRing: row.data.colorRing,
        placeName: row.data.place,
        placeCode: row.data.eu_placeCode.toString().toUpperCase(),
        remarks: `${row.data.ringer || ''} ${row.data.remarks || ''}`,
      };

      excelData.observations.push(Object.assign({}, rowData, defaults));
    }

    delete excelData.addedData;
  };

  // TODO: clarify if we need to support multiple files
  public async import(files: Express.Multer.File[]): Promise<DataCheckDto> {
    if (!files.length) {
      throw new CustomError('No files detected', 400);
    }

    this.filterFiles(files);

    const [file] = files;

    const workbook: Workbook = await new Excel.Workbook().xlsx.load(file.buffer);
    const excelHeaders: HeaderCheck = await checkObservationsHeaderNames(workbook, 'validate-xls');

    if (!excelHeaders.verified) {
      throw new CustomError(`Missing header titles: ${excelHeaders.errors.join(',')}`, 400);
    }

    const checkedFormatData = await checkObservationImportedData(workbook);
    await this.checkEuRingCodes(checkedFormatData);
    await this.checkPossibleClones(checkedFormatData);
    await this.setXLSDataToObservation(checkedFormatData);
    delete checkedFormatData.validFormatData;

    return checkedFormatData;
  }
}
