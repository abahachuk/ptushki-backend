import { IProcessor } from 'typeorm-fixtures-cli';
import { CatchingLures } from '../entities/euring-codes/catching-lures-entity';

/* eslint-disable */
const makeid = (i: number): string => '-UABCDEFGHMN'[i];

/* class-methods-use-this */
export default class CatchingLuresProcessor implements IProcessor<CatchingLures> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g,''))),
    };
  }
}


