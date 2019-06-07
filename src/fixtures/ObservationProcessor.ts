import { IProcessor } from 'typeorm-fixtures-cli';
import { Observation } from '../entities/observation-entity';

export default class ObservationProcessor implements IProcessor<Observation> {
  /* eslint-disable-next-line class-methods-use-this */
  public postProcess(_name: string, object: Observation): void {
    /* eslint-disable-next-line no-param-reassign */
    object.ringMentioned = object.ring.identificationNumber;
  }
}
