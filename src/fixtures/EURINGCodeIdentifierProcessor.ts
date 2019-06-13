import { IProcessor } from 'typeorm-fixtures-cli';
import { EURINGCodeIdentifier } from '../entities/euring-codes';

/* eslint-disable  class-methods-use-this */
export default class EURINGCodeIdentifierProcessor implements IProcessor<EURINGCodeIdentifier> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: parseInt(name.replace(/\D/g, ''), 10),
    };
  }
}
