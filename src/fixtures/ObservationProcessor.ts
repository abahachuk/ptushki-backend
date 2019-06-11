import { IProcessor } from 'typeorm-fixtures-cli';
import { Observation } from '../entities/observation-entity';

export default class ObservationProcessor implements IProcessor<Observation> {
  /* eslint-disable-next-line class-methods-use-this */
  public postProcess(_name: string, object: Observation): void {
    /* eslint-disable no-param-reassign */
    object.ringMentioned = object.ring.identificationNumber;
    object.distance = object.distance ? object.distance.toString().padStart(5, '0') : '-----';
    object.direction = object.direction ? object.direction.toString().padStart(3, '0') : '---';
    object.elapsedTime = object.elapsedTime ? object.elapsedTime.toString().padStart(5, '0') : '-----';
  }
}
