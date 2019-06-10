import { IProcessor } from 'typeorm-fixtures-cli';
import { VerificationOfTheMetalRing } from '../entities/euring-codes';

const makeid = (i: number): string => '019'[i];

export default class VerificationOfTheMetalRingProcessor implements IProcessor<VerificationOfTheMetalRing> {
  /* eslint-disable class-methods-use-this */
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g, ''), 10)),
    };
  }
}
