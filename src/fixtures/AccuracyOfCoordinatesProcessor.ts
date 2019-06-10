import { IProcessor } from 'typeorm-fixtures-cli';
import { AccuracyOfCoordinates } from '../entities/euring-codes';

/* eslint-disable class-methods-use-this */
export default class AccuracyOfCoordinatesProcessor implements IProcessor<AccuracyOfCoordinates> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: parseInt(name.replace(/\D/g, ''), 10),
    };
  }
}
