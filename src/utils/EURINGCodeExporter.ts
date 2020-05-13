import { EURINGParsedString } from '../entities/common-interfaces';
import { Observation } from '../entities/observation-entity';
import { Ring } from '../entities/ring-entity';
import { fromDateToEuringDate, fromDateToEuringTime } from './date-parser';
import { fromDecimalToEuring } from './coords-parser';
import { fromNumberToPaddedString } from './custom-parsers';

const safeNumtoString = (num: number | null): string => (typeof num === 'number' ? num.toString(10) : '');

export default (entity: Observation | Ring): string => {
  const arrayPropsForString: EURINGParsedString = [
    entity.ringingScheme.id,
    entity.primaryIdentificationMethod.id,
    entity.identificationNumber, // we are using mentioned instead related
    safeNumtoString(entity.verificationOfTheMetalRing.id),
    safeNumtoString(entity.metalRingInformation.id),
    entity.otherMarksInformation.id,
    entity.speciesMentioned.id,
    entity.speciesConcluded.id,
    entity.manipulated.id,
    safeNumtoString(entity.movedBeforeTheCapture.id),
    entity.catchingMethod.id,
    entity.catchingLures.id,
    entity.sexMentioned.id,
    entity.sexConcluded.id,
    entity.ageMentioned.id,
    entity.ageConcluded.id,
    entity.status.id,
    entity.broodSize.id,
    entity.pullusAge.id,
    entity.accuracyOfPullusAge.id,
    fromDateToEuringDate(entity.date),
    safeNumtoString(entity.accuracyOfDate.id),
    fromDateToEuringTime(entity.date),
    entity.placeCode.id,
    fromDecimalToEuring(entity.latitude, entity.longitude),
    safeNumtoString(entity.accuracyOfCoordinates.id),
    safeNumtoString(entity.condition.id),
    entity.circumstances.id,
    safeNumtoString(entity.circumstancesPresumed.id),
    safeNumtoString(entity.euringCodeIdentifier.id),
    fromNumberToPaddedString(entity.distance as number, 5) || '-'.repeat(5),
    fromNumberToPaddedString(entity.direction as number, 3) || '-'.repeat(3),
    fromNumberToPaddedString(entity.elapsedTime as number, 5) || '-'.repeat(5),
    '', // wing length
    '', // third primary
    '', // state of wing point
    '', // mass
    '', // moult
    '', // plumage code
    '', // hind claw
    '', // bill length
    '', // bill method
    '', // total head length
    '', // tarsus
    '', // tarsus method
    '', // tail length
    '', // tail differnce
    '', // fat score
    '', // fat score method
    '', // pectoral muscle
    '', // brood patch
    '', // primary score
    '', // primary moult
    '', // old greater coverts
    '', // alula
    '', // carpal covert
    '', // sexing method
    entity.placeName || '',
    entity.remarks || '',
    '', // reference
  ];

  return arrayPropsForString.join('|');
};
