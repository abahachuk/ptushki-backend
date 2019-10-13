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

export enum SortingDirection {
  asc = 'ASC',
  desk = 'DESC',
}

export interface Search {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  sortingColumn?: string;
  sortingDirection?: SortingDirection;
}

export type Locale = 'eng' | 'rus' | 'byn';
