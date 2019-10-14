import { IProcessor } from 'typeorm-fixtures-cli';
import { Conditions } from '../entities/euring-codes';

/* eslint-disable class-methods-use-this */
export default class ConditionsProcessor implements IProcessor<Conditions> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: parseInt(name.replace(/\D/g, ''), 10),
    };
  }
}
