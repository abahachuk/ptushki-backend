import { IProcessor } from 'typeorm-fixtures-cli';
import { Species } from '../entities/euring-codes/species-entity';

export default class SpeciesProcessor implements IProcessor<Species> {
  /* eslint-disable class-methods-use-this */
  public preProcess(name: string, object: any): any {
    return {
      ...object,
      id: name.replace(/\D/g, '').padStart(5, '0'),
    };
  }
}
