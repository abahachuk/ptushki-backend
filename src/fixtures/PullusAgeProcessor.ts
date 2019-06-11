import { IProcessor } from 'typeorm-fixtures-cli';
import { PullusAge } from '../entities/euring-codes';

const ids = ['--'].concat(
  Array(100)
    .fill('')
    .map((_n, i) => i.toString().padStart(2, '0')),
);

const makeid = (i: number): string => ids[i];

/* eslint-disable class-methods-use-this */
export default class PullusAgeProcessor implements IProcessor<PullusAge> {
  public preProcess(name: string, object: any): any {
    console.log(makeid(parseInt(name.replace(/\D/g, ''), 10)));
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g, ''), 10)),
    };
  }
}
