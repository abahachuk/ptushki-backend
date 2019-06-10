import { IProcessor } from 'typeorm-fixtures-cli';
import { AccuracyOfPullusAge } from '../entities/euring-codes';

/* eslint-disable */
const makeid = (i: number): string => '-0123456789U'[i];

/* class-methods-use-this */
export default class AccuracyOfPullusAgeProcessor implements IProcessor<AccuracyOfPullusAge> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g,''))),
    };
  }
}
