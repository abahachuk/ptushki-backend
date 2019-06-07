import { IProcessor } from 'typeorm-fixtures-cli';
import { Age } from '../entities/euring-codes/age-entity';

/* eslint-disable */
const makeid = (i: number): string => '0123456789ABCDEFGHIJK'[i];

/* class-methods-use-this */
export default class AgeProcessor implements IProcessor<Age> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name)),
    };
  }
}
