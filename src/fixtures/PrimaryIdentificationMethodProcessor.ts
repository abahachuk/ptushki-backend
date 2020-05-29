import { IProcessor } from 'typeorm-fixtures-cli';
import { PrimaryIdentificationMethod } from '../entities/euring-codes';

const firstMarks = 'ABCDEFGHKLRT';

const ids: string[] = [...firstMarks].map(f => `${f}0`);

const makeid = (i: number): string => ids[i];

export default class PrimaryIdentificationMethodProcessor implements IProcessor<PrimaryIdentificationMethod> {
  /* eslint-disable class-methods-use-this */
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g, ''), 10)),
    };
  }
}
