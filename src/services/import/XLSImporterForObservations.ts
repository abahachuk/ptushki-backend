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

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type ObservationFieldsRequiredForXLS = Omit<
  Observation,
  | 'id'
  | 'photos'
  | 'finder' // for a while skipped for simplicity
  | 'offlineFinder' // for a while skipped for simplicity
  | 'offlineFinderNote' // for a while skipped for simplicity
  | 'exportEURING' // skip model method
  | 'importEURING' // skip model method
  | 'ring' // unknown -- can be added only by lookup through ring's table
  // with ringMentioned by this we can fill other fields below:
  | 'identificationNumber' // filled only if corresponding ring found
  | 'speciesConcluded' // can be computed only through ring
  | 'ageConcluded' // can be computed only through ring
  | 'sexConcluded' // can be computed only through ring
  | 'verified' // model sets it to pending by default
  | 'distance' // can be computed only through ring
  | 'direction' // can be computed only through ring
  | 'elapsedTime' // can be computed only through ring
>;

interface EURINGs {
  [index: string]: string[] | number[];
}

// todo next one interface should extend ImportWorksheetXLSDto

interface ImportWorksheetObservationXLSCommon {
  importedCount: number;
  rowCount: number;
  emptyRowCount: number;
  EURINGErrors: { rowNumber: number; result: { [index: string]: any[] } }[];
  formatErrors: { rowNumber: number; result: { [index: string]: any[] } }[];
  clones: number[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ImportWorksheetObservationXLSDto extends ImportWorksheetObservationXLSCommon {}

interface ImportWorksheetObservationXLSStatus extends ImportWorksheetObservationXLSCommon {
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
      acc[splitKey] = await getCustomRepository(cachedEURINGCodes[key]).getAllIds();
      return acc;
    }, Promise.resolve({}));
  })();

  public static mappers: { [index in keyof ObservationFieldsRequiredForXLS]: [string, (arg: any) => any] } = {
    ringMentioned: ['Номер кольца', v => v.toString()],
    ringingScheme: ['Схема кольцевания', v => v.toString().toUpperCase()],
    primaryIdentificationMethod: ['Первичный метод идентификации', v => v.toString().toUpperCase()],
    verificationOfTheMetalRing: ['Верификация металлического кольца', v => Number(v)],
    metalRingInformation: ['Информация о металлическом кольце', v => Number(v)],
    otherMarksInformation: ['Информация о других метках', v => v.toString().toUpperCase()],
    euringCodeIdentifier: ['EURING идентификатор', v => Number(v)],
    speciesMentioned: ['Вид', v => v.toString().toUpperCase()],
    sexMentioned: ['Пол', v => v.toString().toUpperCase()],
    ageMentioned: ['Возраст', v => v.toString().toUpperCase()],
    placeCode: ['Код места', v => v.toString().toUpperCase()],
    placeName: ['Место', v => v.toString().toUpperCase()],
    broodSize: ['Размер гнезда', v => v.toString()],
    movedBeforeTheCapture: ['Передвижения до наблюдения', v => v.toString()],
    colorRing: ['Цветное кольцо', v => (v ? v.toString() : null)],
    status: ['Статус', v => v.toString().toUpperCase()],
    condition: ['Состояние', v => v.toString().toUpperCase()],
    circumstances: ['Обстоятельства', v => v.toString().toUpperCase()],
    circumstancesPresumed: ['Точность обстоятельств', v => v.toString().toUpperCase()],
    date: ['Дата', v => new Date(v.toString()).toISOString()],
    latitude: ['Широта', v => Number(v)],
    longitude: ['Долгота', v => Number(v)],
    remarks: ['Пометки', v => (v ? v.toString() : null)],
    manipulated: ['Проведенные манипуляции', v => v.toString().toUpperCase() || 'U'],
    catchingMethod: ['Метод отлова', v => v.toString().toUpperCase() || 'U'],
    catchingLures: ['Приманки для отлова', v => v.toString().toUpperCase() || 'U'],
    pullusAge: ['Возраст птенца', v => v.toString().toUpperCase() || 'U'],
    accuracyOfDate: ['Точность даты', v => Number(v) || 9],
    accuracyOfCoordinates: ['Точность координат', v => Number(v) || 9],
    accuracyOfPullusAge: ['Точность возраста птенца', v => v.toString().toUpperCase()],
  };

  public static expectedColumnHeaders: string[] = Object.values(XLSImporterForObservations.mappers).map(
    ([header]) => header,
  );

  public mapParsedWorksheetRow(row: any, status: ImportWorksheetObservationXLSStatus, i: number): any {
    const errors: { [index: string]: string[] } = {};
    const mappedRow = Object.entries(XLSImporterForObservations.mappers).reduce(
      (acc: { [index: string]: any }, [key, [field, f]]) => {
        try {
          acc[key] = f(row[field]);
        } catch (e) {
          errors[field] = [e.message];
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

  public async import({ sources }: ImportInput<Express.Multer.File>): Promise<ImportWorksheetObservationXLSDto> {
    try {
      if (!sources.length) {
        throw new CustomError('No files detected', 400);
      }
      this.filterFiles(sources);

      // TODO: clarify if we need to support multiple files
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

      // redefine place in process of checking: right now it's done on data
      // and already validated entities are skipped by this there are two options
      // to do this on validated entities
      // or do it before validation

      // take in account that order needs to be preserved
      // to correctly specify row number
      this.checkForClones(importStatus);

      if (
        !Object.keys(importStatus.EURINGErrors).length &&
        !Object.keys(importStatus.formatErrors).length &&
        !importStatus.clones.length
      ) {
        await this.observations.insert(importStatus.validEntities);
        importStatus.importedCount = importStatus.validEntities.length;
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
        importedCount: 0,
        emptyRowCount: 0,
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
    const { rowCount, emptyRowCount, EURINGErrors, formatErrors, clones, importedCount } = status;
    return {
      rowCount,
      emptyRowCount,
      importedCount,
      EURINGErrors,
      formatErrors,
      clones,
    };
  }
}
