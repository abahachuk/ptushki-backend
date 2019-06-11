import { IProcessor } from 'typeorm-fixtures-cli';
import { AccuracyOfDate } from '../entities/euring-codes';

/* eslint-disable class-methods-use-this */
export default class AccuracyofDateProcessor implements IProcessor<AccuracyOfDate> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: parseInt(name.replace(/\D/g, ''), 10),
    };
  }
}
