import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsUUID,
  Length,
  IsDateString,
  IsString,
  IsOptional,
  IsAlpha,
  IsAlphanumeric,
  IsInt,
  Min,
  Max,
  IsNumberString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { IsAlphaWithHyphen, IsAlphanumericWithHyphen, IsNumberStringWithHyphen } from '../validation/custom-decorators';
import { equalLength } from '../validation/validation-messages';
import { User, UserDto } from './user-entity';
import { Person, PersonDto } from './person-entity';
import { Ring, RingDto } from './ring-entity';
import {
  Sex,
  Age,
  Species,
  SpeciesDto,
  Manipulated,
  MovedBeforeTheCapture,
  CatchingMethod,
  CatchingLures,
  AccuracyOfDate,
  AccuracyOfCoordinates,
  Status,
  PullusAge,
  AccuracyOfPullusAge,
  Conditions,
  Circumstances,
  CircumstancesPresumed,
  PlaceCode,
  PlaceCodeDto,
  RingingScheme,
  PrimaryIdentificationMethod,
  VerificationOfTheMetalRing,
  MetalRingInformation,
  OtherMarksInformation,
  EURINGCodeIdentifier,
  BroodSize,
} from './euring-codes';
import { AbleToExportAndImportEuring, EntityDto, EURINGCodes } from './common-interfaces';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { fromDateToEuringDate, fromDateToEuringTime, fromEuringToDate } from '../utils/date-parser';
import { fromDecimalToEuring, DecimalCoordinates, fromEuringToDecimal } from '../utils/coords-parser';
import { fromStringToValueOrNull, fromNumberToPaddedString } from '../utils/custom-parsers';

export enum Verified {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

// From mobile and web we accept entity with not all field filled
interface RawObservationBase<TCommon, TSpecies> {
  ringMentioned: string;
  speciesMentioned: TSpecies;
  sexMentioned: TCommon;
  ageMentioned: TCommon;
  latitude: number;
  longitude: number;
  date: Date;
  accuracyOfDate: TCommon;
  photos?: string[];
  remarks?: string;
}

// Model for observation with all not technical fields
// Used for dtos for responses
export interface ObservationBase<TFinder, TOfFinder, TCommon, TRing, TSpecies, TPlaceCode>
  extends RawObservationBase<TCommon, TSpecies> {
  id: string;
  ring: TRing;
  speciesConcluded: TSpecies;
  sexConcluded: TCommon;
  ageConcluded: TCommon;
  finder: TFinder;
  offlineFinder: TOfFinder;
  offlineFinderNote: string | null;
  distance: number | null;
  direction: number | null;
  elapsedTime: number | null;
  colorRing: string | null;
  ringingScheme: EntityDto;
  primaryIdentificationMethod: EntityDto;
  verificationOfTheMetalRing: EntityDto;
  metalRingInformation: EntityDto;
  otherMarksInformation: EntityDto;
  euringCodeIdentifier: EntityDto;
  broodSize: EntityDto;
  manipulated: EntityDto;
  movedBeforeTheCapture: EntityDto;
  catchingMethod: EntityDto;
  catchingLures: EntityDto;
  accuracyOfCoordinates: EntityDto;
  status: EntityDto;
  pullusAge: EntityDto;
  accuracyOfPullusAge: EntityDto;
  condition: EntityDto;
  circumstances: EntityDto;
  circumstancesPresumed: EntityDto;
  placeCode: TPlaceCode;
  placeName: string | null;
  verified: Verified;
}

// Can't use type due to typescript-swagger restrictions
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RawObservationDto extends RawObservationBase<string, string> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ObservationBaseDto extends ObservationBase<string, string, string, string, string, string> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ObservationDto
  extends ObservationBase<UserDto, PersonDto, EntityDto, RingDto, SpeciesDto, PlaceCodeDto> {}

@Entity()
export class Observation implements ObservationDto, AbleToExportAndImportEuring, EURINGCodes {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @IsOptional()
  @IsUUID()
  @ManyToOne(() => Ring, m => m.observation, {
    eager: false,
  })
  public ring: Ring;

  @IsOptional()
  @IsString()
  @Length(10, 10, { message: equalLength(10) })
  @Column('varchar', { nullable: true, default: null })
  public ringMentioned: string;

  public get identificationNumber(): string {
    return this.ringMentioned;
  }

  @IsOptional()
  @IsUUID()
  @ManyToOne(() => User, m => m.observation, {
    eager: true,
  })
  public finder: User;

  @IsOptional()
  @IsUUID()
  @ManyToOne(() => Person, m => m.observation, {
    eager: true,
  })
  public offlineFinder: Person;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  // README this field is caused fact the most finders are denormalized in access
  // in other words it's alternate to offlineFinder field to store data
  public offlineFinderNote: string | null;

  @IsOptional()
  @IsString({ each: true })
  @Column('varchar', { array: true, nullable: true, default: null })
  public photos: string[];

  @IsOptional()
  @IsAlpha()
  @Length(3, 3, { message: equalLength(3) })
  @ManyToOne(() => RingingScheme, m => m.observation, {
    eager: true,
  })
  public ringingScheme: RingingScheme;

  @IsOptional()
  @IsAlphanumeric()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => PrimaryIdentificationMethod, m => m.observation, {
    eager: true,
  })
  public primaryIdentificationMethod: PrimaryIdentificationMethod;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => VerificationOfTheMetalRing, m => m.observation, {
    eager: true,
  })
  public verificationOfTheMetalRing: VerificationOfTheMetalRing;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7)
  @ManyToOne(() => MetalRingInformation, m => m.observation, {
    eager: true,
  })
  public metalRingInformation: MetalRingInformation;

  @IsOptional()
  @IsAlpha()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => OtherMarksInformation, m => m.observation, {
    eager: true,
  })
  public otherMarksInformation: OtherMarksInformation;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  @ManyToOne(() => EURINGCodeIdentifier, m => m.observation, {
    eager: true,
  })
  public euringCodeIdentifier: EURINGCodeIdentifier;

  @IsOptional()
  @IsNumberStringWithHyphen()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => BroodSize, m => m.observation, {
    eager: true,
  })
  public broodSize: BroodSize;

  @IsNumberString()
  @Length(5, 5, { message: equalLength(5) })
  @ManyToOne(() => Species, m => m.mentionedInObservation, {
    eager: true,
  })
  public speciesMentioned: Species;

  @IsOptional()
  @IsNumberString()
  @Length(5, 5, { message: equalLength(5) })
  @ManyToOne(() => Species, m => m.concludedInObservation, {
    eager: true,
  })
  public speciesConcluded: Species;

  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Sex, m => m.mentionedInObservation, {
    eager: true,
  })
  public sexMentioned: Sex;

  @IsOptional()
  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Sex, m => m.concludedInObservation, {
    eager: true,
  })
  public sexConcluded: Species;

  @IsAlphanumeric()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Age, m => m.mentionedInObservation, {
    eager: true,
  })
  public ageMentioned: Age;

  @IsOptional()
  @IsAlphanumeric()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Age, m => m.concludedInObservation, {
    eager: true,
  })
  public ageConcluded: Age;

  // Related field in access 'Derived data distance'
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99999)
  @Column('integer', { nullable: true, default: null })
  public distance: number;

  // Related field in access 'Derived data directions'
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(359)
  @Column('smallint', { nullable: true, default: null })
  public direction: number;

  // Related field in access 'Derived data elapsed time'
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99999)
  @Column('integer', { nullable: true, default: null })
  public elapsedTime: number | null;

  // Not presented in euring standart
  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public colorRing: string | null;

  @IsOptional()
  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Manipulated, m => m.observation, {
    eager: true,
  })
  public manipulated: Manipulated;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => MovedBeforeTheCapture, m => m.observation, {
    eager: true,
  })
  public movedBeforeTheCapture: MovedBeforeTheCapture;

  @IsOptional()
  @IsAlphaWithHyphen()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => CatchingMethod, m => m.observation, {
    eager: true,
  })
  public catchingMethod: CatchingMethod;

  @IsOptional()
  @IsAlphaWithHyphen()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => CatchingLures, m => m.observation, {
    eager: true,
  })
  public catchingLures: CatchingLures;

  @IsDateString()
  @Column('varchar', { nullable: true, default: null })
  public date: Date;

  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => AccuracyOfDate, m => m.observation, {
    eager: true,
  })
  public accuracyOfDate: AccuracyOfDate;

  // Related fields in access 'Lat deg', 'Lat min', 'Lat sec'
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Column('decimal', {
    precision: 10,
    scale: 8,
    nullable: true,
    default: null,
    transformer: new ColumnNumericTransformer(),
  })
  public latitude: number;

  // Related fields in access 'Lon deg', 'Lon min', 'Lon sec'
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Column('decimal', {
    precision: 11,
    scale: 8,
    nullable: true,
    default: null,
    transformer: new ColumnNumericTransformer(),
  })
  public longitude: number;

  @IsOptional()
  @IsAlphanumericWithHyphen()
  @Length(4, 4, { message: equalLength(4) })
  @ManyToOne(() => PlaceCode, m => m.ring, {
    eager: true,
  })
  public placeCode: PlaceCode;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => AccuracyOfCoordinates, m => m.observation, {
    eager: true,
  })
  public accuracyOfCoordinates: AccuracyOfCoordinates;

  @IsOptional()
  @IsAlphaWithHyphen()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Status, m => m.observation, {
    eager: true,
  })
  public status: Status;

  @IsOptional()
  @IsNumberStringWithHyphen()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => PullusAge, m => m.observation, {
    eager: true,
  })
  public pullusAge: PullusAge;

  @IsOptional()
  @IsAlphanumericWithHyphen()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => AccuracyOfPullusAge, m => m.observation, {
    eager: true,
  })
  public accuracyOfPullusAge: AccuracyOfPullusAge;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => Conditions, m => m.ring, {
    eager: true,
  })
  public condition: Conditions;

  @IsOptional()
  @IsNumberString()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => Circumstances, m => m.ring, {
    eager: true,
  })
  public circumstances: Circumstances;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  @ManyToOne(() => CircumstancesPresumed, m => m.ring, {
    eager: true,
  })
  public circumstancesPresumed: CircumstancesPresumed;

  // Related fields in access 'Place'
  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public placeName: string | null;

  // Related field in access 'Note'
  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public remarks: string;

  // Not presented in euring standart
  @IsOptional()
  @IsEnum(Verified)
  @Column({
    type: 'enum',
    enum: Verified,
    default: Verified.Pending,
  })
  public verified: Verified;

  public static async create(
    observation: RawObservationDto & { finder: string; ring: string | null },
  ): Promise<Observation> {
    return Object.assign(new Observation(), observation);
  }

  public exportEURING(): string {
    return [
      this.ringingScheme.id,
      this.primaryIdentificationMethod.id,
      this.identificationNumber, // we are using mentioned instead related
      this.verificationOfTheMetalRing.id,
      this.metalRingInformation.id,
      this.otherMarksInformation.id,
      this.speciesMentioned.id,
      this.speciesConcluded.id,
      this.manipulated.id,
      this.movedBeforeTheCapture.id,
      this.catchingMethod.id,
      this.catchingLures.id,
      this.sexMentioned.id,
      this.sexConcluded.id,
      this.ageMentioned.id,
      this.ageConcluded.id,
      this.status.id,
      this.broodSize.id,
      this.pullusAge.id,
      this.accuracyOfPullusAge.id,
      fromDateToEuringDate(this.date),
      this.accuracyOfDate.id,
      fromDateToEuringTime(this.date),
      this.placeCode.id,
      fromDecimalToEuring(this.latitude, this.longitude),
      this.accuracyOfCoordinates.id,
      this.condition.id,
      this.circumstances.id,
      this.circumstancesPresumed.id,
      this.euringCodeIdentifier.id,
      fromNumberToPaddedString(this.distance, 5) || '-'.repeat(5),
      fromNumberToPaddedString(this.direction, 3) || '-'.repeat(3),
      fromNumberToPaddedString(this.elapsedTime as number, 5) || '-'.repeat(5),
      // Below unsupported parameters that presented in EURING
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
      this.placeName,
      this.remarks,
      '', // reference
    ].join('|');
  }

  /* eslint-disable */
  public importEURING(code: string): Observation {
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
      elapsedTime,
      // Below params except "placeName" and "remarks" are unsupported, but they presented in EURING
      // @ts-ignore
      wingLength,
      // @ts-ignore
      thirdPrimary,
      // @ts-ignore
      stateOfWingPoint,
      // @ts-ignore
      mass,
      // @ts-ignore
      moult,
      // @ts-ignore
      plumageCode,
      // @ts-ignore
      hindClaw,
      // @ts-ignore
      billLength,
      // @ts-ignore
      billMethod,
      // @ts-ignore
      totalHeadLength,
      // @ts-ignore
      tarsus,
      // @ts-ignore
      tarsusMethod,
      // @ts-ignore
      tailLength,
      // @ts-ignore
      tailDiffernce,
      // @ts-ignore
      fatScore,
      // @ts-ignore
      fatScoreMethod,
      // @ts-ignore
      pectoralMuscle,
      // @ts-ignore
      broodPatch,
      // @ts-ignore
      primaryScore,
      // @ts-ignore
      primaryMoult,
      // @ts-ignore
      oldGreaterCoverts,
      // @ts-ignore
      alula,
      // @ts-ignore
      carpalCovert,
      // @ts-ignore
      sexingMethod,
      // @ts-ignore
      placeName,
      remarks,
      // @ts-ignore
      reference,
    ] = code.split('|');

    const { latitude, longitude }: DecimalCoordinates = fromEuringToDecimal(latitudeLongitude);

    return Object.assign(this, {
      ringingScheme: fromStringToValueOrNull(ringingScheme),
      primaryIdentificationMethod: fromStringToValueOrNull(primaryIdentificationMethod),
      verificationOfTheMetalRing: fromStringToValueOrNull(verificationOfTheMetalRing, Number),
      metalRingInformation: fromStringToValueOrNull(metalRingInformation, Number),
      otherMarksInformation: fromStringToValueOrNull(otherMarksInformation),
      broodSize: fromStringToValueOrNull(broodSize),
      euringCodeIdentifier: fromStringToValueOrNull(euringCodeIdentifier, Number),
      ringMentioned: fromStringToValueOrNull(identificationNumber),
      speciesMentioned: fromStringToValueOrNull(speciesMentioned),
      speciesConcluded: fromStringToValueOrNull(speciesConcluded),
      manipulated: fromStringToValueOrNull(manipulated),
      movedBeforeTheCapture: fromStringToValueOrNull(movedBeforeTheCapture, Number),
      catchingMethod: fromStringToValueOrNull(catchingMethod),
      catchingLures: fromStringToValueOrNull(catchingLures),
      sexMentioned: fromStringToValueOrNull(sexMentioned),
      sexConcluded: fromStringToValueOrNull(sexConcluded),
      ageMentioned: fromStringToValueOrNull(ageMentioned),
      ageConcluded: fromStringToValueOrNull(ageConcluded),
      status: fromStringToValueOrNull(status),
      pullusAge: fromStringToValueOrNull(pullusAge),
      accuracyOfPullusAge: fromStringToValueOrNull(accuracyOfPullusAge),
      date: fromEuringToDate(date, time),
      accuracyOfDate: fromStringToValueOrNull(accuracyOfDate, Number),
      placeCode: fromStringToValueOrNull(placeCode),
      latitude,
      longitude,
      accuracyOfCoordinates: fromStringToValueOrNull(accuracyOfCoordinates, Number),
      condition: fromStringToValueOrNull(condition, Number),
      circumstances: fromStringToValueOrNull(circumstances),
      circumstancesPresumed: fromStringToValueOrNull(circumstancesPresumed, Number),
      distance: fromStringToValueOrNull(distance, Number),
      direction: fromStringToValueOrNull(direction, Number),
      elapsedTime: fromStringToValueOrNull(elapsedTime, Number),
      placeName: fromStringToValueOrNull(placeName),
      remarks: fromStringToValueOrNull(remarks),
    });
  }
}
