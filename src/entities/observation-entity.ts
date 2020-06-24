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
import { AbleToImportEURINGCode, EntityDto, EURINGCodes } from './common-interfaces';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import EURINGCodeParser from '../utils/EURINGCodeParser';

export interface NewObservation {
  finder: User;
}

export enum Verified {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

// TODO: extract right fields for raw observation from mobile and web
// From mobile and web we accept entity with not all field filled
interface RawObservationBase<TCommon, TRing, TSpecies, TPlaceCode> {
  ring: TRing;
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
  accuracyOfDate: TCommon;
  placeCode: TPlaceCode;
}

// Model for observation with all not technical fields
// Used for dtos for responses
export interface ObservationBase<TFinder, TOfFinder, TCommon, TRing, TSpecies, TPlaceCode>
  extends RawObservationBase<TCommon, TRing, TSpecies, TPlaceCode> {
  id: string;
  speciesConcluded: TSpecies;
  sexConcluded: TCommon;
  ageConcluded: TCommon;
  finder: TFinder;
  offlineFinder: TOfFinder;
  offlineFinderNote: string | null;
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
  placeName: string | null;
  verified: Verified;
}

// Can't use type due to typescript-swagger restrictions
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RawObservationDto extends RawObservationBase<string, string, string, string> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ObservationBaseDto extends ObservationBase<string, string, string, string, string, string> {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ObservationDto
  extends ObservationBase<UserDto, PersonDto, EntityDto, RingDto, SpeciesDto, PlaceCodeDto> {}

@Entity()
export class Observation implements ObservationDto, AbleToImportEURINGCode, EURINGCodes {
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

  @IsAlpha()
  @Length(3, 3, { message: equalLength(3) })
  @ManyToOne(() => RingingScheme, m => m.observation, {
    eager: true,
  })
  public ringingScheme: RingingScheme;

  @IsAlphanumeric()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => PrimaryIdentificationMethod, m => m.observation, {
    eager: true,
  })
  public primaryIdentificationMethod: PrimaryIdentificationMethod;

  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => VerificationOfTheMetalRing, m => m.observation, {
    eager: true,
  })
  public verificationOfTheMetalRing: VerificationOfTheMetalRing;

  @IsInt()
  @Min(0)
  @Max(7)
  @ManyToOne(() => MetalRingInformation, m => m.observation, {
    eager: true,
  })
  public metalRingInformation: MetalRingInformation;

  @IsAlphaWithHyphen()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => OtherMarksInformation, m => m.observation, {
    eager: true,
  })
  public otherMarksInformation: OtherMarksInformation;

  @IsInt()
  @Min(0)
  @Max(4)
  @ManyToOne(() => EURINGCodeIdentifier, m => m.observation, {
    eager: true,
  })
  public euringCodeIdentifier: EURINGCodeIdentifier;

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

  public importEURING(code: string): Observation {
    const preEntity = EURINGCodeParser(code);
    const { identificationNumber: ringMentioned } = preEntity;
    delete preEntity.identificationNumber;
    return Object.assign(this, preEntity, { ringMentioned });
  }
}
