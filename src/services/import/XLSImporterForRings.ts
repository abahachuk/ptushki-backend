import { getRepository, Repository } from 'typeorm';
import { ImporterType } from './AbstractImporter';
import XLSBaseImporter from './XLSBaseImporter';
import { Ring } from '../../entities/ring-entity';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RingFieldsRequiredForXLS = Omit<
  Ring,
  | 'id'
  | 'observation' // for a while skipped for simplicity
  | 'ringer' // for a while skipped for simplicity
  | 'offlineRinger' // for a while skipped for simplicity
  | 'exportEURING' // skip model method
  | 'importEURING' // skip model method
  | 'speciesConcluded' // todo clarify
  | 'ageConcluded' // todo clarify
  | 'sexConcluded' // todo clarify
>;

export default class XLSImporterForRings extends XLSBaseImporter {
  public readonly type: ImporterType = ImporterType.xls;

  public readonly route: string = 'rings-by';

  public readonly entity = Ring;

  public readonly repository: Repository<Ring> = getRepository(Ring);

  public static readonly mappers: { [index in keyof RingFieldsRequiredForXLS]: [string, (arg: any) => any] } = {
    identificationNumber: ['Идентификационный номер', v => v.toString().toUpperCase()],
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
    broodSize: ['Размер гнезда', v => v.toString()],
    movedBeforeTheCapture: ['Передвижения до наблюдения', v => v.toString()],
    status: ['Статус', v => v.toString().toUpperCase()],
    condition: ['Состояние', v => v.toString().toUpperCase()],
    circumstances: ['Обстоятельства', v => v.toString().toUpperCase()],
    circumstancesPresumed: ['Точность обстоятельств', v => v.toString().toUpperCase()],
    date: ['Дата', v => new Date(v.toString()).toISOString()],
    latitude: ['Широта', v => Number(v)],
    longitude: ['Долгота', v => Number(v)],
    statusOfRing: ['Cтатус кольца', v => v.toString().toUpperCase()],
    remarks: ['Пометки', v => (v ? v.toString() : null)],
    manipulated: ['Проведенные манипуляции', v => v.toString().toUpperCase() || 'U'],
    catchingMethod: ['Метод отлова', v => v.toString().toUpperCase() || 'U'],
    catchingLures: ['Приманки для отлова', v => v.toString().toUpperCase() || 'U'],
    pullusAge: ['Возраст птенца', v => v.toString().toUpperCase() || 'U'],
    accuracyOfDate: ['Точность даты', v => Number(v) || 9],
    accuracyOfCoordinates: ['Точность координат', v => Number(v) || 9],
    accuracyOfPullusAge: ['Точность возраста птенца', v => v.toString().toUpperCase()],
  };

  public static readonly expectedColumnHeaders: string[] = XLSBaseImporter.getHeaders(XLSImporterForRings.mappers);

  public readonly expectedColumnHeaders = XLSImporterForRings.expectedColumnHeaders;

  public readonly mappers = XLSImporterForRings.mappers;
}
