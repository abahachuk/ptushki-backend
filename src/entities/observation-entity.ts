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
import { User } from './user-entity';
import { Ring } from './ring-entity';
import {
  Sex,
  Age,
  Species,
  Manipulated,
  MovedBeforeTheCapture,
  CatchingMethod,
  CatchingLures,
  AccuracyOfDate,
  AccuracyOfCoordinates,
  Status,
  PullusAge,
  AccuracyOfPullusAge,
  Condition,
  Circumstances,
  CircumstancesPresumed,
  PlaceCode,
} from './euring-codes';
import { AbleToExportAndImportEuring } from './common-interfaces';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { fromDateToEuringDate, fromDateToEuringTime, fromEuringToDate } from '../utils/date-parser';
import { fromDecimalToEuring, DecimalCoordinates, fromEuringToDecimal } from '../utils/coords-parser';

export interface NewObservation {
  finder: User;
}

export enum Verified {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

@Entity()
export class Observation implements AbleToExportAndImportEuring {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @IsOptional()
  @IsUUID()
  @ManyToOne(() => Ring, m => m.observation, {
    eager: true,
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
  public photos: string[] | null;

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
  public distance: number | null;

  // Related field in access 'Derived data directions'
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(359)
  @Column('smallint', { nullable: true, default: null })
  public direction: number | null;

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
  public date: Date | null;

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
  public latitude: number | null;

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
  public longitude: number | null;

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
  @ManyToOne(() => Condition, m => m.ring, {
    eager: true,
  })
  public condition: Condition;

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
  public remarks: string | null;

  // Not presented in euring standart
  @IsOptional()
  @IsEnum(Verified)
  @Column({
    type: 'enum',
    enum: Verified,
    default: Verified.Pending,
  })
  public verified: Verified;

  public static async create(observation: NewObservation): Promise<Observation> {
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
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      this.placeName,
      this.remarks,
      '',
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
      ringMentioned: identificationNumber || null,
      speciesMentioned: speciesMentioned || null,
      manipulated: manipulated || null,
      movedBeforeTheCapture: Number(movedBeforeTheCapture) || null,
      catchingMethod: catchingMethod || null,
      catchingLures: catchingLures || null,
      sexMentioned: sexMentioned || null,
      sexConcluded: sexConcluded || null,
      ageMentioned: ageMentioned || null,
      ageConcluded: ageConcluded || null,
      status: status || null,
      pullusAge: pullusAge || null,
      accuracyOfPullusAge: accuracyOfPullusAge || null,
      date: fromEuringToDate(date, time),
      accuracyOfDate: Number(accuracyOfDate) || null,
      placeCode: placeCode || null,
      latitude,
      longitude,
      accuracyOfCoordinates: Number(accuracyOfCoordinates) || null,
      condition: Number(condition) || null,
      circumstances: circumstances || null,
      circumstancesPresumed: Number(circumstancesPresumed) || null,
      distance: Number(distance) || null,
      direction: Number(direction) || null,
      elapsedTime: Number(elapsedTime) || null,
      placeName: placeName || null,
      remarks: remarks || null,
    });
  }
}
