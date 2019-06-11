import { IProcessor } from 'typeorm-fixtures-cli';
import { BroodSize } from '../entities/euring-codes';

const ids = ['--'].concat(
  Array(99)
    .fill('')
    .map((_n, i) => i.toString().padStart(2, '0')),
);

const makeid = (i: number): string => ids[i];

/* eslint-disable class-methods-use-this */
export default class BroodSizeProcessor implements IProcessor<BroodSize> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g, ''), 10)),
    };
  }
}
