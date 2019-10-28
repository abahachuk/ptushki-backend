import { Observation } from '../../entities/observation-entity';
// import { Ring } from '../../entities/ring-entity';
import { logger } from '../../utils/logger';
import { fromDegreesToDecimal } from '../../utils/coords-parser';

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

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type ObservationMap = {
  // todo review later excluded fields
  [index in keyof Omit<Observation, 'id' | 'ringMentioned' | 'photos' | 'exportEURING' | 'importEURING'>]:
    | ((item: any) => any)
    | string
};

export const observationMap: ObservationMap = {
  ring: () => null,
  colorRing: 'Color ring',
  finder: () => null,
  verified: () => false,
  // ---------------------------------
  // Metal ring information
  // Verification of metal ring
  // Other mark information
  // Broodsize
  // Euring-code identifier
  // Finder
  // E-mail
  // ------------------------
  date,
  longitude,
  latitude,
  distance: 'Derived data distance',
  direction: 'Derived data directions',
  elapsedTime: 'Derived data elapsed time',
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

export function observationMapper(dbRecords: any[]): Observation[] {
  const observations: Observation[] = dbRecords
    .map((dbObservation: any) => {
      try {
        const ring = observationsKeys.reduce(
          (acc: { [index in keyof ObservationMap]: any }, key: keyof ObservationMap) => {
            const map = observationMap[key];
            acc[key] = typeof map === 'function' ? map(dbObservation) : dbObservation[map];
            return acc;
          },
          {},
        );
        return ring;
      } catch (e) {
        logger.error(`Observation ${dbObservation.RefNo} can't be mapped: skipped`);
        return null;
      }
    })
    .filter(ring => !!ring)
    .map(mapped => Object.assign(new Observation(), mapped));
  return observations;
}
