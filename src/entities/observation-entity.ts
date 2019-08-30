import { path } from 'ramda';
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
} from './euring-codes';
import { AbleToExportAndImportEuring, EntityDto } from './common-interfaces';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { fromDateToEuringDate, fromDateToEuringTime, fromEuringToDate } from '../utils/date-parser';
import { fromDecimalToEuring, DecimalCoordinates, fromEuringToDecimal } from '../utils/coords-parser';
import { fromStringToValueOrNull } from '../utils/custom-parsers';

export interface NewObservation {
  finder: User;
}

export enum Verified {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

interface RawObservationBase<TCommon, TRing, TSpecies> {
  ring: TRing;
  speciesConcluded: TSpecies;
  sexConcluded: TCommon;
  ageConcluded: TCommon;
  ringMentioned: string;
  speciesMentioned: TSpecies;
  sexMentioned: TCommon;
  ageMentioned: TCommon;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  distance?: number;
  direction?: number;
  remarks?: string;
  date?: Date;
  accuracyOfDate: EntityDto;
  placeCode: PlaceCodeDto;
}

export interface ObservationBase<TFinder, TCommon, TRing, TSpecies>
  extends RawObservationBase<TCommon, TRing, TSpecies> {
  id: string;
  finder: TFinder;
  elapsedTime: number | null;
  colorRing: string | null;
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
  placeName: string | null;
  verified: Verified;
}

// Can't use type due to typescript-swagger restrictions
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RawObservationDto extends RawObservationBase<string, string, string> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ObservationBaseDto extends ObservationBase<string, string, string, string> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ObservationDto extends ObservationBase<UserDto, EntityDto, RingDto, SpeciesDto> {}

@Entity()
export class Observation implements ObservationDto, AbleToExportAndImportEuring {
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

  @IsOptional()
  @IsUUID()
  @ManyToOne(() => User, m => m.observation, {
    eager: true,
  })
  public finder: User;

  @IsOptional()
  @IsString({ each: true })
  @Column('varchar', { array: true, nullable: true, default: null })
  public photos: string[];

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

  @IsAlphanumeric()
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

  public static async create(observation: RawObservationDto & { finder: string }): Promise<Observation> {
    return Object.assign(new Observation(), observation);
  }

  public exportEURING(): string {
    return [
      path(['ring', 'ringingScheme', 'id'], this),
      path(['ring', 'primaryIdentificationMethod', 'id'], this),
      path(['ring', 'identificationNumber'], this),
      path(['ring', 'verificationOfTheMetalRing', 'id'], this),
      path(['ring', 'metalRingInformation', 'id'], this),
      path(['ring', 'otherMarksInformation', 'id'], this),
      path(['speciesMentioned', 'id'], this),
      path(['manipulated', 'id'], this),
      path(['movedBeforeTheCapture', 'id'], this),
      path(['catchingMethod', 'id'], this),
      path(['catchingLures', 'id'], this),
      path(['sexMentioned', 'id'], this),
      path(['sexConcluded', 'id'], this),
      path(['ageMentioned', 'id'], this),
      path(['ageConcluded', 'id'], this),
      path(['status', 'id'], this),
      path(['ring', 'broodSize', 'id'], this),
      path(['pullusAge', 'id'], this),
      path(['accuracyOfPullusAge', 'id'], this),
      fromDateToEuringDate(this.date),
      path(['accuracyOfDate', 'id'], this),
      fromDateToEuringTime(this.date),
      path(['placeCode', 'id'], this),
      fromDecimalToEuring(this.latitude, this.longitude),
      path(['accuracyOfCoordinates', 'id'], this),
      path(['condition', 'id'], this),
      path(['circumstances', 'id'], this),
      path(['circumstancesPresumed', 'id'], this),
      path(['ring', 'euringCodeIdentifier', 'id'], this),
      this.distance,
      this.direction,
      this.elapsedTime,
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
  public importEURING(code: string): any {
    const [
      // @ts-ignore
      ringingScheme, // Presented in ring entity
      // @ts-ignore
      primaryIdentificationMethod, // Presented in ring entity
      identificationNumber,
      // @ts-ignore
      verificationOfTheMetalRing, // Presented in ring entity
      // @ts-ignore
      metalRingInformation, // Presented in ring entity
      // @ts-ignore
      otherMarksInformation, // Presented in ring entity
      speciesMentioned,
      manipulated,
      movedBeforeTheCapture,
      catchingMethod,
      catchingLures,
      sexMentioned,
      sexConcluded,
      ageMentioned,
      ageConcluded,
      status,
      // @ts-ignore
      broodSize, // Presented in ring entity
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
      // @ts-ignore
      euringCodeIdentifier, // Presented in ring entity
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
      ringMentioned: fromStringToValueOrNull(identificationNumber),
      speciesMentioned: fromStringToValueOrNull(speciesMentioned),
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
