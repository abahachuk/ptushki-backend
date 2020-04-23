import Excel, { Workbook } from 'exceljs';
import { getCustomRepository, getRepository, Repository, QueryFailedError } from 'typeorm';
import { validate } from 'class-validator';
import AbstractImporter, { ImporterType, ImportInput } from './AbstractImporter';
import { MulterOptions } from '../../controllers/upload-files-controller';
import { CustomError } from '../../utils/CustomError';
import { workbookParser } from '../excel-service/helper';
import { Observation } from '../../entities/observation-entity';
import { cachedEURINGCodes } from '../../entities/euring-codes/cached-entities-fabric';
import { parseValidationErrors } from '../../validation/validation-results-parser';

// TODO should be used by exporter too
type ExpectedColumnHeaders =
  | 'ringNumber'
  | 'colorRing'
  | 'ringingScheme'
  | 'primaryIdentificationMethod'
  | 'verificationOfTheMetalRing'
  | 'metalRingInformation'
  | 'otherMarksInformation'
  | 'euringCodeIdentifier'
  | 'speciesMentioned'
  | 'sexMentioned'
  | 'ageMentioned'
  | 'placeCode'
  | 'euringCodeIdentifier'
  | 'broodSize'
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
  rowCount: number;
  emptyRowCount: number;
  importedCount: number;
  EURINGErrors: { rowNumber: number; result: { [index: string]: any[] } }[];
  formatErrors: { rowNumber: number; result: { [index: string]: any[] } }[];
  clones: number[];
}

interface ImportWorksheetObservationXLSStatus extends ImportWorksheetObservationXLSDto {
  headers: any[];
  data: any[];
  validEntities: any[];
}

export default class XLSImporterForObservations extends AbstractImporter<
  ImportInput<Express.Multer.File>,
  ImportWorksheetObservationXLSDto
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
      const splitKey = (s => s[0].toLowerCase() + s.slice(1))(key.replace('Cached', ''));
      acc[splitKey] = (await getCustomRepository(cachedEURINGCodes[key]).find()).map(
        ({ id }: { id: string | number }) => id,
      );
      return acc;
    }, Promise.resolve({}));
  })();

  // FIXME there should be issues with matching keys between data and models
  // TODO fields should be declared in other way using model as source
  //  but also should be considered fact that names wouldn't match model's fields,
  //  then these mappings should be redefined
  public static mappers: { [index in ExpectedColumnHeaders]: (arg: any) => any } = {
    ringNumber: v => v.toString(),
    ringingScheme: v => v.toString().toUpperCase(),
    primaryIdentificationMethod: v => v.toString().toUpperCase(),
    verificationOfTheMetalRing: v => Number(v),
    metalRingInformation: v => Number(v),
    otherMarksInformation: v => v.toString().toUpperCase(),
    euringCodeIdentifier: v => Number(v),
    speciesMentioned: v => v.toString(),
    sexMentioned: v => v.toString().toUpperCase(),
    ageMentioned: v => v.toString(),
    placeCode: v => v.toString().toUpperCase(),
    broodSize: v => v.toString(),
    colorRing: v => (v ? v.toString() : null),
    sex: v => v.toString().toUpperCase(),
    species: v => v.toString().toUpperCase(),
    status: v => v.toString().toUpperCase(),
    date: v => new Date(v.toString()).toISOString(),
    age: v => v.toString().toUpperCase(),
    place: v => v.toString(),
    latitude: v => Number(v),
    longitude: v => Number(v),
    ringer: v => (v ? v.toString() : null),
    remarks: v => (v ? v.toString() : null),
    manipulated: v => v.toString().toUpperCase() || 'U',
    catchingMethod: v => v.toString().toUpperCase() || 'U',
    catchingLures: v => v.toString().toUpperCase() || 'U',
    accuracyOfDate: v => Number(v) || 9, // could be 0
  };

  public static expectedColumnHeaders: string[] = Object.keys(XLSImporterForObservations.mappers);

  public mapParsedWorksheetRow(row: any, status: ImportWorksheetObservationXLSStatus, i: number): any {
    const errors: { [index: string]: string[] } = {};
    const mappedRow = Object.entries(XLSImporterForObservations.mappers).reduce(
      (acc: { [index: string]: any }, [key, f]) => {
        try {
          acc[key] = f(row[key]);
        } catch (e) {
          errors[key] = [e.message];
        }
        return acc;
      },
      {},
    );

    if (!errors.length) {
      return mappedRow;
    }
    // eslint-disable-next-line no-param-reassign
    status.formatErrors.push({ rowNumber: i + 1, result: errors });
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
      status.formatErrors.push({ rowNumber: i + 1, result: parsedErrors });
      throw new Error();
    }
    return entity;
  }

  public checkEURINGcodes(entity: any, status: ImportWorksheetObservationXLSStatus, i: number, codes: any): void {
    const wrongKeys = Object.entries(entity)
      .filter(([key, value]) => (codes[key] ? !codes[key].includes(value) : false))
      .reduce((acc: { [index: string]: any }, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    if (Object.keys(wrongKeys).length) {
      // eslint-disable-next-line no-param-reassign
      status.EURINGErrors.push({ rowNumber: i + 1, result: wrongKeys });
      throw new Error();
    }
  }

  // TODO: clarify if we need to support multiple files

  public async import({ sources }: ImportInput<Express.Multer.File>): Promise<ImportWorksheetObservationXLSDto> {
    try {
      if (!sources.length) {
        throw new CustomError('No files detected', 400);
      }
      this.filterFiles(sources);

      const [file] = sources;

      const workbook: Workbook = await new Excel.Workbook().xlsx.load(file.buffer);
      const importStatus: ImportWorksheetObservationXLSStatus = this.initImportStatus();
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

      return this.translateStatusForResponse(importStatus);
    } catch (e) {
      if (e instanceof CustomError) throw e;
      // @ts-ignore-next-line
      if (e instanceof QueryFailedError) throw new CustomError(`${e.name}: ${e.detail}`, 500);
      throw new CustomError(e.message, 500);
    }
  }

  public checkForClones(status: ImportWorksheetObservationXLSStatus): void {
    // redefine place in process of checking: right now it's done on data
    // and already validated entities are skipped by this there are two options
    // to do this on validated entities
    // or do it before validation

    // take in account that order needs to be preserved
    // to correctly specify row number

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

  private initImportStatus(): ImportWorksheetObservationXLSStatus {
    return Object.assign(
      {},
      {
        rowCount: 0,
        emptyRowCount: 0,
        importedCount: 0,
        headers: [],
        data: [],
        validEntities: [],
        EURINGErrors: [],
        formatErrors: [],
        clones: [],
      },
    );
  }

  private translateStatusForResponse(status: ImportWorksheetObservationXLSStatus): ImportWorksheetObservationXLSDto {
    const { rowCount, emptyRowCount, EURINGErrors, formatErrors, clones, validEntities } = status;
    return {
      rowCount,
      emptyRowCount,
      importedCount: validEntities.length,
      EURINGErrors,
      formatErrors,
      clones,
    };
  }
}
