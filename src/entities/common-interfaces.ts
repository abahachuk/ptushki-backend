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
  statusOfRing: any;
}

export interface Dictionary {
  desc_eng: string | null;
  desc_rus?: string | null;
  desc_byn?: string | null;
}

export interface AbleToExportAndImportEuring {
  exportEURING(): string;
  importEURING(code: string): any;
}
