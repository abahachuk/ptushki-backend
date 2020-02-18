import { IProcessor } from 'typeorm-fixtures-cli';
import { Person } from '../entities/person-entity';

/* eslint-disable class-methods-use-this */
export default class PersonProcessor implements IProcessor<Person> {
  public preProcess(_name: string, object: any): any {
    return object;
  }
}
