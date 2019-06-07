import { IProcessor } from 'typeorm-fixtures-cli';
import { CatchingMethod } from '../entities/euring-codes/catching-method-entity';

/* eslint-disable */
const makeid = (i: number): string => '-ABCDEFGHLMNOPRSTUVWZ'[i];

/* class-methods-use-this */
export default class CatchingMethodProcessor implements IProcessor<CatchingMethod> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name)),
    };
  }
}


