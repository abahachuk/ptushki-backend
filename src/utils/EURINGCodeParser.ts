import { EURINGCodes, EURINGCodeAsArray } from '../entities/common-interfaces';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type EURINGCodeAsString = Omit<EURINGCodes, 'longitude' | 'latitude'> & {
  date: string;
  time: string;
  latitudeLongitude: string;
  distance: string;
  direction: string;
  elapsedTime: string;
  placeName: string;
  remarks: string;
  reference: string;
};

/* eslint-disable no-unused-vars */
export default (code: string): EURINGCodeAsString => {
  const arrayOfCodes = code.split('|') as EURINGCodeAsArray;

  const [
    ringingScheme,
    primaryIdentificationMethod,
    identificationNumber,
    verificationOfTheMetalRing,
    metalRingInformation,
    otherMarksInformation,
    speciesMentioned,
    speciesConcluded,
    manipulated,
    movedBeforeTheCapture,
    catchingMethod,
    catchingLures,
    sexMentioned,
    sexConcluded,
    ageMentioned,
    ageConcluded,
    status,
    broodSize,
    pullusAge,
    accuracyOfPullusAge,
    date,
    accuracyOfDate,
    time,
    placeCode,
    latitudeLongitude,
    accuracyOfCoordinates,
    condition,
    circumstances,
    circumstancesPresumed,
    euringCodeIdentifier,
    distance,
    direction,
    elapsedTime, // wingLength // thirdPrimary // stateOfWingPoint // mass // moult // plumageCode // hindClaw // billLength // billMethod // totalHeadLength // tarsus // tarsusMethod // tailLength // tailDiffernce // fatScore // fatScoreMethod // pectoralMuscle // broodPatch // primaryScore // primaryMoult // oldGreaterCoverts // alula // carpalCovert // sexingMethod
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    placeName,
    remarks,
    reference,
  ] = arrayOfCodes;

  return {
    ringingScheme,
    primaryIdentificationMethod,
    identificationNumber,
    verificationOfTheMetalRing,
    metalRingInformation,
    otherMarksInformation,
    speciesMentioned,
    speciesConcluded,
    manipulated,
    movedBeforeTheCapture,
    catchingMethod,
    catchingLures,
    sexMentioned,
    sexConcluded,
    ageMentioned,
    ageConcluded,
    status,
    broodSize,
    pullusAge,
    accuracyOfPullusAge,
    date,
    accuracyOfDate,
    time,
    placeCode,
    latitudeLongitude,
    accuracyOfCoordinates,
    condition,
    circumstances,
    circumstancesPresumed,
    euringCodeIdentifier,
    distance,
    direction,
    elapsedTime,
    placeName,
    remarks,
    reference,
  };
};
