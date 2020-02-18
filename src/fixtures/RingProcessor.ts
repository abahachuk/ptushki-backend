import { IProcessor } from 'typeorm-fixtures-cli';
import { Ring } from '../entities/ring-entity';

/* eslint-disable */
const makeid = (length: number): string => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const randomInteger = (length: number): number => Math.round(Math.random() * 10 ** length);
const randomInRange = (max: number): number => Math.round(Math.random() * max) + 1;

/* class-methods-use-this */
export default class RingProcessor implements IProcessor<Ring> {
  public preProcess(_name: string, object: any): any {
    const identificationSeries = makeid(randomInRange(4)).toString();
    const identificationNumber = randomInteger(5).toString();
    return {
      ...object,
      identificationNumber: `${identificationSeries}${identificationNumber.padStart(
        10 - identificationSeries.length,
        '.',
      )}`,
    };
  }

  public postProcess(_name: string, object: Ring): void {
    /* eslint-disable no-param-reassign */
    const offlineRingerProbability = Math.random();

    if (offlineRingerProbability < 0.2) {
      delete object.ringer;
    } else {
      delete object.offlineRinger;
    }
  }
}
