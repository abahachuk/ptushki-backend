import { IProcessor } from 'typeorm-fixtures-cli';
import { MovedBeforeTheCapture } from '../entities/euring-codes/moved-before-capture-entity';

/* eslint-disable */
const makeid = (i: number): string => '02469'[i];

/* class-methods-use-this */
export default class MovedBeforeTheCaptureProcessor implements IProcessor<MovedBeforeTheCapture> {
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: makeid(parseInt(name.replace(/\D/g,''))),
    };
  }
}


