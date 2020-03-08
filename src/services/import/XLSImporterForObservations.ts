import Excel, { Workbook } from 'exceljs';
import { getCustomRepository, getRepository, Repository } from 'typeorm';
import { validate } from 'class-validator';
import AbstractImporter, { ImporterType, ImportInput } from './AbstractImporter';
import { MulterOptions } from '../../controllers/upload-files-controller';
import { CustomError } from '../../utils/CustomError';
import {
  checkObservationImportedData,
  checkObservationsHeaderNames,
  DataCheck,
  DataCheckDto,
  EURingError,
  RawData,
  RowErorr,
  RowValidatedData,
  workbookParser,
} from '../excel-service/helper';
import { Observation } from '../../entities/observation-entity';
import { cachedEURINGCodes } from '../../entities/euring-codes/cached-entities-fabric';
import { Age, PlaceCode, Sex, Species, Status } from '../../entities/euring-codes';
import { parseValidationErrors } from '../../validation/validation-results-parser';

type ExpectedColumnHeaders =
  | 'ringNumber'
  | 'colorRing'
  | 'sex'
  | 'species'
  | 'status'
  | 'date'
  | 'accuracyOfDate'
  | 'age'
  | 'place'
  | 'latitude'
  | 'longitude'
  | 'ringer'
  | 'manipulated'
  | 'catchingMethod'
  | 'catchingLures'
  | 'remarks';

interface EURINGs {
  [index: string]: string[] | number[];
}

// todo next one interface should extend ImportWorksheetXLSDto

export interface ImportWorksheetObservationXLSDto {
  rowCount: number; // берется из XLS
  emptyRowCount: number; // пустышки
  importedCount: number; // и его количество
  EURINGErrors: { [index: number]: string }; // ошибки с кодами
  formatErrors: { [index: number]: string }; // ошибки валидации
  clones: number[]; // вызов метода
}

interface ImportWorksheetObservationXLSStatus extends ImportWorksheetObservationXLSDto {
  rowCount: number; // берется из XLS
  emptyRowCount: number;
  headers: any[];
  data: any[];
  EURINGErrors: { [index: number]: string };
  formatErrors: { [index: number]: string };
  clones: number[];
  validEntities: any[];
}

export default class XLSImporterForObservations extends AbstractImporter<
  ImportInput<Express.Multer.File>,
  DataCheckDto
> {
  public type: ImporterType = ImporterType.xls;

  public route: string = 'observations';

  private observations: Repository<Observation> = getRepository(Observation);

  public options: MulterOptions = {
    extensions: ['.xls', '.xlsx'],
    any: true,
  };

  public static EURINGcodes: Promise<EURINGs> = (async () => {
    return Object.keys(cachedEURINGCodes).reduce(async (promise: Promise<EURINGs>, key: string) => {
      const acc = await promise;
      acc[key] = (await getCustomRepository(cachedEURINGCodes[key]).find()).map(
        ({ id }: { id: string | number }) => id,
      );
      return acc;
    }, Promise.resolve({}));
  })();

  public static mappers: { [index in ExpectedColumnHeaders]: (arg: any) => any } = {
    /* eslint-disable @typescript-eslint/camelcase */
    ringNumber: v => v.toString(),
    colorRing: v => v.toString(),
    sex: v => v.toString().toUpperCase(),
    species: v => v.toString().toUpperCase(),
    status: v => v.toString().toUpperCase(),
    date: v => new Date(v.toString()).toISOString(),
    age: v => v.toString().toUpperCase(),
    place: v => v.toString(),
    latitude: v => Number(v),
    longitude: v => Number(v),
    ringer: v => v.toString(),
    remarks: v => v.toString(),
    manipulated: v => v.toString().toUpperCase() || 'U',
    catchingMethod: v => v.toString().toUpperCase() || 'U',
    catchingLures: v => v.toString().toUpperCase() || 'U',
    accuracyOfDate: v => Number(v) || 9,
    /* eslint-enable @typescript-eslint/camelcase */
  };

  public static expectedColumnHeaders: string[] = Object.keys(XLSImporterForObservations.mappers);

  // eslint-disable-next-line no-unused-vars
  public mapParsedWorksheetRow(row: any, status: ImportWorksheetObservationXLSStatus, i: number): any {
    const errors: string[] = [];
    const mappedRow = Object.entries(XLSImporterForObservations.mappers).reduce(
      (acc: { [index: string]: any }, [key, f]) => {
        try {
          acc[key] = f(row[key]);
        } catch (e) {
          errors.push(key);
        }
        return acc;
      },
      {},
    );

    if (errors.length) {
      return mappedRow;
    }
    // eslint-disable-next-line no-param-reassign
    status.formatErrors[i] = `Unable map next fields: ${errors.join(', ')}`;
    throw new Error();
  }

  public async createEntityAndValidate(
    preEntity: any,
    status: ImportWorksheetObservationXLSStatus,
    i: number,
  ): Promise<void | any> {
    const entity = Observation.create(preEntity);
    const errors = await validate(entity);
    if (errors.length) {
      const parsedErrors = parseValidationErrors(errors);
      // eslint-disable-next-line no-param-reassign
      status.formatErrors[i] = `Unable create entity because next fields: ${parsedErrors.toString()}`;
      throw new Error();
    }
    return entity;
  }

  public checkEURINGcodes(entity: any, status: ImportWorksheetObservationXLSStatus, i: number, codes: any): void {
    const wrongKeys = Object.entries(entity).filter(([key, value]) =>
      codes[key] ? !codes[key].includes(value) : false,
    );
    if (!wrongKeys.length) return entity;
    // eslint-disable-next-line no-param-reassign
    status.EURINGErrors[i] = `Unable ${wrongKeys.join(', ')}`;
    throw new Error();
  }

  public checkForClones(status: ImportWorksheetObservationXLSStatus): void {
    const { data } = status;
    const map = new Map();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < data.length; i++) {
      const row = JSON.stringify(data);
      if (!row) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (map.has(row)) {
        status.clones.push(i + 2);
      } else {
        map.set(JSON.stringify(data), i);
      }
    }
  }

  // TODO: clarify if we need to support multiple files

  public async import({ sources }: ImportInput<Express.Multer.File>): Promise<DataCheckDto> {
    try {
      if (!sources.length) {
        throw new CustomError('No files detected', 400);
      }
      this.filterFiles(sources);

      const [file] = sources;

      const workbook: Workbook = await new Excel.Workbook().xlsx.load(file.buffer);
      await checkObservationsHeaderNames(workbook, 'xls');

      const checkedFormatData = await checkObservationImportedData(workbook);

      if (checkedFormatData.invalidDataFormat.length) {
        delete checkedFormatData.validFormatData;
        return checkedFormatData;
      }

      await this.checkEuRingCodes(checkedFormatData);

      if (checkedFormatData.euRingErrors.length) {
        delete checkedFormatData.validFormatData;
        return checkedFormatData;
      }

      await this.checkPossibleClones(checkedFormatData);
      await this.setXLSDataToObservation(checkedFormatData);

      // FIXME enable importing when logic will be cleared and fits models
      // await this.importValidRows(checkedFormatData.observations);

      checkedFormatData.importedCount = checkedFormatData.observations.length;
      delete checkedFormatData.validFormatData;
      delete checkedFormatData.observations;

      return checkedFormatData;
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(e.message, 500);
    }
  }

  public async import2({ sources }: ImportInput<Express.Multer.File>): Promise<ImportWorksheetObservationXLSDto> {
    try {
      if (!sources.length) {
        throw new CustomError('No files detected', 400);
      }
      this.filterFiles(sources);

      const [file] = sources;

      const workbook: Workbook = await new Excel.Workbook().xlsx.load(file.buffer);
      const importStatus: ImportWorksheetObservationXLSStatus = {
        rowCount: 0,
        emptyRowCount: 0,
        importedCount: 0,
        headers: [],
        data: [],
        validEntities: [],
        EURINGErrors: {},
        formatErrors: {},
        clones: [],
      };

      const [worksheet] = workbookParser(workbook, XLSImporterForObservations.expectedColumnHeaders, importStatus);
      const codes = await XLSImporterForObservations.EURINGcodes;

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < worksheet.data.length; i++) {
        try {
          const preEntity = this.mapParsedWorksheetRow(worksheet.data[i], importStatus, i);
          // eslint-disable-next-line no-await-in-loop
          const entity = await this.createEntityAndValidate(preEntity, importStatus, i);
          this.checkEURINGcodes(entity, importStatus, i, codes);
          importStatus.validEntities.push(entity);
          // eslint-disable-next-line no-empty
        } catch {}
      }

      this.checkForClones(importStatus);

      if (
        !Object.keys(importStatus.EURINGErrors).length &&
        !Object.keys(importStatus.formatErrors).length &&
        !importStatus.clones.length
      ) {
        await this.observations.insert(importStatus.validEntities);
      }

      const { rowCount, emptyRowCount, EURINGErrors, formatErrors, importedCount, clones } = importStatus;
      return {
        rowCount,
        emptyRowCount,
        importedCount,
        EURINGErrors,
        formatErrors,
        clones,
      };
    } catch (e) {
      if (e instanceof CustomError) throw e;
      throw new CustomError(e.message, 500);
    }
  }

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

  // TODO private importValidRows = async (validObservations: RawData[]): Promise<void> => {
  //   await this.observations.insert(validObservations);
  // };
}
