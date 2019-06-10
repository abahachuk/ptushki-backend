import { IProcessor } from 'typeorm-fixtures-cli';
import { AccuracyOfPullusAge } from '../entities/euring-codes';

/* eslint-disable class-methods-use-this */
export default class AccuracyOfPullusAgeProcessor implements IProcessor<AccuracyOfPullusAge> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: parseInt(name.replace(/\D/g, ''), 10),
    };
  }
}
