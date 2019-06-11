import { IProcessor } from 'typeorm-fixtures-cli';
import { Circumstances } from '../entities/euring-codes';

const excludedIds = new Set(['04', '05', '17', '18', '39', '79', '92', '93', '94', '95', '96', '97', '98']);
const ids: string[] = Array(100)
  .fill('')
  .map((_n, i) => i.toString().padStart(2, '0'))
  .filter(i => !excludedIds.has(i));

const makeid = (i: number): string => ids[i];

/* eslint-disable  class-methods-use-this */
export default class CircumstancesProcessor implements IProcessor<Circumstances> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g, ''), 10)),
    };
  }
}
