import Excel, { Workbook } from 'exceljs';
import { getRepository, Repository, QueryFailedError } from 'typeorm';
import { ImporterType, ImportInput } from './AbstractImporter';
import XLSBaseImporter, { ImportWorksheetXLSDto } from './XLSBaseImporter';
import { CustomError } from '../../utils/CustomError';
import { workbookParser } from '../excel-service/helper';
import { Observation } from '../../entities/observation-entity';

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

export default class XLSImporterForObservations extends XLSBaseImporter {
  public type: ImporterType = ImporterType.xls;

  public route: string = 'observations';

  private observations: Repository<Observation> = getRepository(Observation);

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

  public async import({ sources }: ImportInput<Express.Multer.File>): Promise<ImportWorksheetXLSDto> {
    try {
      if (!sources.length) {
        throw new CustomError('No files detected', 400);
      }
      this.filterFiles(sources);

      // TODO: clarify if we need to support multiple files
      const [file] = sources;

      const workbook: Workbook = await new Excel.Workbook().xlsx.load(file.buffer);
      const importStatus = this.initImportStatus();
      const [worksheet] = workbookParser(workbook, XLSImporterForObservations.expectedColumnHeaders, importStatus);
      const codes = await XLSImporterForObservations.EURINGcodes;

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < worksheet.data.length; i++) {
        try {
          const preEntity = this.mapParsedWorksheetRow(worksheet.data[i], importStatus, i);
          // eslint-disable-next-line no-await-in-loop
          const entity = await this.createEntityAndValidate(Observation, preEntity, importStatus, i);
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
}
