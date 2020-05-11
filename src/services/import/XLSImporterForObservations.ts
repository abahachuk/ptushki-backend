import { getRepository, Repository } from 'typeorm';
import { ImporterType } from './AbstractImporter';
import XLSBaseImporter from './XLSBaseImporter';
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
  public readonly type: ImporterType = ImporterType.xls;

  public readonly route: string = 'observations';

  public readonly entity = Observation;

  public readonly repository: Repository<Observation> = getRepository(Observation);

  public static readonly mappers: { [index in keyof ObservationFieldsRequiredForXLS]: [string, (arg: any) => any] } = {
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

  public static readonly expectedColumnHeaders: string[] = XLSBaseImporter.getHeaders(
    XLSImporterForObservations.mappers,
  );

  public readonly expectedColumnHeaders = XLSImporterForObservations.expectedColumnHeaders;

  public readonly mappers = XLSImporterForObservations.mappers;
}
