export type EURINGParsedString = [
  string, // ringingScheme
  string, // primaryIdentificationMethod
  string, // identificationNumber
  string, // verificationOfTheMetalRing
  string, // metalRingInformation
  string, // otherMarksInformation
  string, // speciesMentioned
  string, // speciesConcluded
  string, // manipulated
  string, // movedBeforeTheCapture
  string, // catchingMethod
  string, // catchingLures
  string, // sexMentioned
  string, // sexConcluded
  string, // ageMentioned
  string, // ageConcluded
  string, // status
  string, // broodSize
  string, // pullusAge
  string, // accuracyOfPullusAge
  string, // date
  string, // accuracyOfDate
  string, // time
  string, // placeCode
  string, // latitudeLongitude
  string, // accuracyOfCoordinates
  string, // condition
  string, // circumstances
  string, // circumstancesPresumed
  string, // euringCodeIdentifier
  string, // distance
  string, // direction
  string, // elapsedTime
  // Below params except "placeName" "remarks" "reference" are unsupported by US
  string, // wingLength
  string, // thirdPrimary
  string, // stateOfWingPoint
  string, // mass
  string, // moult
  string, // plumageCode
  string, // hindClaw
  string, // billLength
  string, // billMethod
  string, // totalHeadLength
  string, // tarsus
  string, // tarsusMethod
  string, // tailLength
  string, // tailDiffernce
  string, // fatScore
  string, // fatScoreMethod
  string, // pectoralMuscle
  string, // broodPatch
  string, // primaryScore
  string, // primaryMoult
  string, // oldGreaterCoverts
  string, // alula
  string, // carpalCovert
  string, // sexingMethod
  string, // placeName
  string, // remarks
  string // reference
];

export interface EURINGCodes {
  identificationNumber: any;
  ringingScheme: any;
  primaryIdentificationMethod: any;
  verificationOfTheMetalRing: any;
  metalRingInformation: any;
  otherMarksInformation: any;
  speciesMentioned: any;
  speciesConcluded: any;
  manipulated: any;
  movedBeforeTheCapture: any;
  catchingMethod: any;
  catchingLures: any;
  sexMentioned: any;
  sexConcluded: any;
  ageMentioned: any;
  ageConcluded: any;
  status: any;
  broodSize: any;
  pullusAge: any;
  accuracyOfPullusAge: any;
  latitude: any;
  longitude: any;
  placeCode: any;
  accuracyOfCoordinates: any;
  condition: any;
  circumstances: any;
  circumstancesPresumed: any;
  accuracyOfDate: any;
  euringCodeIdentifier: any;
}

export interface WithDescription {
  desc_eng?: string;
  desc_rus?: string;
  desc_byn?: string;
}

export interface EntityDto extends WithDescription {
  id: string | number;
}

export interface AbleToExportAndImportEuring {
  exportEURING(): string;
  importEURING(code: string): any;
}
