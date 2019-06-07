import { IProcessor } from 'typeorm-fixtures-cli';
import { Sex } from '../entities/euring-codes/sex-entity';

/* eslint-disable */
const makeid = (i: number): string => 'MFU'[i];

/* class-methods-use-this */
export default class SexProcessor implements IProcessor<Sex> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g,''))),
    };
  }
}
