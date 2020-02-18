import { IProcessor } from 'typeorm-fixtures-cli';
import { Observation } from '../entities/observation-entity';

export default class ObservationProcessor implements IProcessor<Observation> {
  /* eslint-disable-next-line class-methods-use-this */
  public postProcess(_name: string, object: Observation): void {
    /* eslint-disable no-param-reassign */
    object.ringMentioned = object.ring.identificationNumber;
    // simplified pullus flow
    if (object.ageMentioned.id === '1') {
      object.status.id = '-';
    } else {
      object.pullusAge.id = '--';
      object.accuracyOfPullusAge.id = '-';
    }

    const offlineFinderProbability = Math.random();

    if (offlineFinderProbability < 0.2) {
      delete object.finder;
      delete object.offlineFinderNote;
    } else if (offlineFinderProbability > 0.8) {
      delete object.offlineFinder;
      delete object.finder;
    } else {
      delete object.offlineFinder;
      delete object.offlineFinderNote;
    }
  }
}
