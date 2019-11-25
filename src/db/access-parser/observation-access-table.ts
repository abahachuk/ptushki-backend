import { Observation, Verified } from '../../entities/observation-entity';
// import { Ring } from '../../entities/ring-entity';
import { logger } from '../../utils/logger';
import { fromDegreesToDecimal } from '../../utils/coords-parser';
import { trimName } from './people-access-table';

const longitude = (item: any): number | null => {
  // todo check fields names
  const { 'Lon side': loside, 'Lon deg': lod, 'Lon min': lom, 'Lon sec': los } = item;
  if (!lod) return null;
  try {
    return fromDegreesToDecimal(Number(lod), Number(lom) || 0, Number(los) || 0, loside === '-');
  } catch (e) {
    throw new Error(`Not able to process longitude`);
  }
};

const latitude = (item: any): number | null => {
  // todo check fields names
  const { 'Lat side': laside, 'Lat deg': lad, 'Lat min': lam, 'Lat sec': las } = item;
  if (!lad) return null;
  try {
    return fromDegreesToDecimal(Number(lad), Number(lam) || 0, Number(las) || 0, laside === '-');
  } catch (e) {
    throw new Error(`Not able to process latitude`);
  }
};

// eslint-disable-next-line no-restricted-globals
const isNumber = (n: any): boolean => !isNaN(parseFloat(n)) && isFinite(n);

const identificationNumber = (item: any): string => {
  const { 'Identification series': series, 'Identification number': number } = item;
  if (!series || !number) {
    throw new Error(`Observation ${item.RefNo} (belonged tp ring: ${item.RN}) haven't or series or number`);
  }
  try {
    return `${series}${'.'.repeat(10 - series.length - number.length)}${number}`;
  } catch {
    throw new Error(`Not able to process identification number & series`);
  }
};

const ring = (item: any, _personsHash: Map<string, string>, ringsHash: Map<string, string>): string | null => {
  const ringNumber = identificationNumber(item);
  if (ringsHash.has(ringNumber)) {
    return ringsHash.get(ringNumber) as string;
  }
  logger.error(
    `It is not possible to establish the related ring: either there is typo in ring number ${ringNumber} or this ring has not been uploaded into the database`,
  );
  return null;
};

const date = (item: any): Date | null => {
  // eslint-disable-next-line prefer-const
  let { 'Date year': year, 'Date month': month, 'Date day': day, 'Time hour': hour, 'Time min': min } = item;
  if (!year || !isNumber(year)) {
    return null;
  }
  if (!hour || !isNumber(hour)) {
    hour = 12;
  }
  if (!min || !isNumber(min)) {
    min = 0;
  }
  return new Date(year, month || 5, day || 15, hour, min);
};

const getNumberOrNull = (value: any): number | null => (Number(value) ? Number(value) : null);

const distance = (item: any): number | null => getNumberOrNull(item['Derived data distance']);
const direction = (item: any): number | null => getNumberOrNull(item['Derived data directions']);
const elapsedTime = (item: any): number | null => getNumberOrNull(item['Derived data elapsed time']);

const offlineFinder = (item: any, personsHash: Map<string, string>): string | null => {
  const finder = trimName(item.Finder);
  if (!finder) {
    return null;
  }

  if (!personsHash.has(finder.toLowerCase())) {
    return null;
  }

  return personsHash.get(finder.toLowerCase()) as string;
};

const offlineFinderNote = (item: any) =>
  trimName(item.Finder) || item['E-mail'] ? `${trimName(item.Finder)} ${item['E-mail']}`.trim() : null;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type ObservationMap = {
  // todo review later excluded fields
  [index in keyof Omit<Observation, 'id' | 'identificationNumber' | 'photos' | 'exportEURING' | 'importEURING'>]:
    | ((...args: any) => any)
    | string
};

export const observationMap: ObservationMap = {
  // README тут есть некоторая условность в том, что скорее всего Access не имеет записей не ссылающихся на кольца
  ringMentioned: identificationNumber,
  ring,
  colorRing: 'Color ring',
  finder: () => null,
  offlineFinder,
  offlineFinderNote,
  verified: () => Verified.Pending,
  ringingScheme: 'Ringing Scheme',
  primaryIdentificationMethod: 'Primary identification method',
  verificationOfTheMetalRing: 'Verification of metal ring',
  metalRingInformation: 'Metal ring information',
  otherMarksInformation: 'Other mark information',
  euringCodeIdentifier: 'Euring-code identifier',
  broodSize: 'Broodsize',
  date,
  longitude,
  latitude,
  distance,
  direction,
  elapsedTime,
  placeCode: 'Place code',
  placeName: 'Place',
  remarks: 'Note',
  speciesMentioned: 'Species by person',
  speciesConcluded: 'Species by Scheme',
  manipulated: 'Manipulated',
  movedBeforeTheCapture: 'Moved befor the (re)capture/recovery',
  catchingMethod: 'Catching method',
  catchingLures: 'Catching lures',
  sexMentioned: 'Sex by person',
  sexConcluded: 'Sex by Scheme',
  ageMentioned: 'Age by person',
  ageConcluded: 'Age by Scheme',
  status: 'Status',
  pullusAge: 'Pullus age',
  accuracyOfPullusAge: 'Accuracy of pullus age',
  accuracyOfDate: 'Accuracy of date',
  accuracyOfCoordinates: 'Accuracy of co-ordinates',
  condition: 'Condition',
  circumstances: 'Circumstances',
  circumstancesPresumed: 'Circumstances presumed',
};

const observationsKeys = Object.keys(observationMap);

const postMapper = (item: Observation) => {
  if (item.offlineFinder) {
    // eslint-disable-next-line no-param-reassign
    item.offlineFinderNote = null;
  }
  return item;
};

export function observationMapper(
  dbRecords: any[],
  personsHash: Map<string, string>,
  ringsHash: Map<string, string>,
): Observation[] {
  const observations: Observation[] = dbRecords
    .map((dbObservation: any) => {
      try {
        const observation = observationsKeys.reduce(
          (acc: { [index in keyof ObservationMap]: any }, key: keyof ObservationMap) => {
            const map = observationMap[key];
            acc[key] = typeof map === 'function' ? map(dbObservation, personsHash, ringsHash) : dbObservation[map];
            return acc;
          },
          {},
        );
        return observation;
      } catch (e) {
        logger.error(`Observation ${dbObservation.RefNo} can't be mapped -- skipped: ${e}`);
        return null;
      }
    })
    .filter(observation => !!observation)
    .map(mapped => postMapper(Object.assign(new Observation(), mapped)));
  return observations;
}
