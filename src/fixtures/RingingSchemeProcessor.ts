import { IProcessor } from 'typeorm-fixtures-cli';
import { RingingScheme } from '../entities/euring-codes/ringing-scheme-entity';

/* eslint-disable class-methods-use-this */
export default class RingingSchemeProcessor implements IProcessor<RingingScheme> {
  public preProcess(_name: string, object: any): any {
    return { ...object, status: [null, '+', 'x'][Math.round(Math.random() * 10) % 3] };
  }
}
