import { IProcessor } from 'typeorm-fixtures-cli';
import { Condition } from '../entities/euring-codes';

/* eslint-disable class-methods-use-this */
export default class ConditionProcessor implements IProcessor<Condition> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: parseInt(name.replace(/\D/g, ''), 10),
    };
  }
}
