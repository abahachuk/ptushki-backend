import { IProcessor } from 'typeorm-fixtures-cli';
import { PlaceCode } from '../entities/euring-codes/place-code-entity';

/* eslint-disable class-methods-use-this */
export default class PlaceCodeProcessor implements IProcessor<PlaceCode> {
  public preProcess(_name: string, object: any): any {
    console.log(JSON.stringify(object, null, 2));
    /* eslint-disable @typescript-eslint/camelcase */
    return {
      ...object,
      desc_eng: `${object.country} ${object.region}`,
    };
  }
}
