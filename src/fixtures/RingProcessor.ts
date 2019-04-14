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

const randomInteger = (length: number): number => {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
};

/* class-methods-use-this */
export default class RingProcessor implements IProcessor<Ring> {
  public preProcess(_name: string, object: any): any {
    const identificationSeries = makeid(Math.random() > 0.5 ? 1 : 2);
    const identificationNumber = randomInteger(5);
    const dots = '.'.repeat(10 - (identificationSeries.length + 5));
    return {
      ...object,
      id: `${identificationSeries} ${identificationNumber}`,
      identificationSeries,
      dots,
      identificationNumber,
    };
  }
}
