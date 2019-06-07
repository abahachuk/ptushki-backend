import { IProcessor } from 'typeorm-fixtures-cli';
import { Status } from '../entities/euring-codes/status-entity';

/* eslint-disable */
const makeid = (i: number): string => '-UNRKMTLWPS'[i];

/* class-methods-use-this */
export default class StatusProcessor implements IProcessor<Status> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g,''))),
    };
  }
}
