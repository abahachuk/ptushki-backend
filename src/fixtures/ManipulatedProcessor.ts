import { IProcessor } from 'typeorm-fixtures-cli';
import { Manipulated } from '../entities/euring-codes/manipulated-entity';

/* eslint-disable */
const makeid = (i: number): string => 'HKCFTMREPNU'[i];

/* class-methods-use-this */
export default class ManipulatedProcessor implements IProcessor<Manipulated> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g,''))),
    };
  }
}


