import { IProcessor } from 'typeorm-fixtures-cli';
import { CircumstancesPresumed } from '../entities/euring-codes';

/* eslint-disable  class-methods-use-this */
export default class CircumstancesPresumedProcessor implements IProcessor<CircumstancesPresumed> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: parseInt(name.replace(/\D/g, ''), 10),
    };
  }
}
