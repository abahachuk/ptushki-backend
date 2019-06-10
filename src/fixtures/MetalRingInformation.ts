import { IProcessor } from 'typeorm-fixtures-cli';
import { MetalRingInformation } from '../entities/euring-codes/metal-ring-information-entity';

/* eslint-disable */
const makeid = (i: number): string => '01234567'[i];

/* class-methods-use-this */
export default class MovedBeforeTheCaptureProcessor implements IProcessor<MetalRingInformation> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g,''))),
    };
  }
}
