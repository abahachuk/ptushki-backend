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
  IsBoolean,
} from 'class-validator';
import { IsAlphaWithHyphen, IsAlphanumericWithHyphen, IsNumberStringWithHyphen } from '../validation/custom-decorators';
import { equalLength } from '../validation/validation-messages';
import { User } from './user-entity';
import { Ring } from './ring-entity';
import { Sex } from './euring-codes/sex-entity';
import { Age } from './euring-codes/age-entity';
import { Species } from './euring-codes/species-entity';
import { Manipulated } from './euring-codes/manipulated-entity';
import { MovedBeforeTheCapture } from './euring-codes/moved-before-capture-entity';
import { CatchingMethod } from './euring-codes/catching-method-entity';
import { CatchingLures } from './euring-codes/catching-lures-entity';
import { AccuracyOfDate } from './euring-codes/accuracy-of-date-entity';
import { AccuracyOfCoordinates } from './euring-codes/accuracy-of-coordinates-entity';
import { Status } from './euring-codes/status-entity';
import { PullusAge } from './euring-codes/pullus-age-entity';
import { AccuracyOfPullusAge } from './euring-codes/accuracy-of-pullus-age-entity';
import { Condition } from './euring-codes/condition-entity';
import { Circumstances } from './euring-codes/circumstances-entity';
import { CircumstancesPresumed } from './euring-codes/circumstances-presumed-entity';

export interface NewObservation {
  finder: User;
}

@Entity()
export class Observation {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @IsOptional()
  @IsUUID()
  @ManyToOne(() => Ring, m => m.observation, {
    eager: true,
  })
  public ring: Ring;

  @IsOptional()
  @IsUUID()
  @ManyToOne(() => User, m => m.observation, {
    eager: true,
  })
  public finder: User;

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
  @IsNumberString()
  @Length(5, 5, { message: equalLength(5) })
  @Column('varchar', { nullable: true, default: null })
  public distance: string | null;

  // Related field in access 'Derived data directions'
  @IsOptional()
  @IsNumberString()
  @Length(3, 3, { message: equalLength(5) })
  @Column('varchar', { nullable: true, default: null })
  public direction: string | null;

  // Related field in access 'Derived data elapsed time'
  @IsOptional()
  @IsNumberString()
  @Length(5, 5, { message: equalLength(5) })
  @Column('varchar', { nullable: true, default: null })
  public elapsedTime: string | null;

  // Not presented in euring standart
  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public colorRing: string | null;

  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Manipulated, m => m.observation, {
    eager: true,
  })
  public manipulated: Manipulated;

  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => MovedBeforeTheCapture, m => m.observation, {
    eager: true,
  })
  public movedBeforeTheCapture: MovedBeforeTheCapture;

  @IsAlphaWithHyphen()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => CatchingMethod, m => m.observation, {
    eager: true,
  })
  public catchingMethod: CatchingMethod;

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

  // Related fields in access 'Lat deg', 'Lat min', 'Lat sec', 'Lon deg', 'Lon min', 'Lon sec',
  @Length(15, 15, { message: equalLength(15) })
  @Column('varchar', { nullable: true, default: null })
  public geographicalCoordinates: string | null;

  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => AccuracyOfCoordinates, m => m.observation, {
    eager: true,
  })
  public accuracyOfCoordinates: AccuracyOfCoordinates;

  @IsAlphaWithHyphen()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Status, m => m.observation, {
    eager: true,
  })
  public status: Status;

  @IsNumberStringWithHyphen()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => PullusAge, m => m.observation, {
    eager: true,
  })
  public pullusAge: PullusAge;

  @IsAlphanumericWithHyphen()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => AccuracyOfPullusAge, m => m.observation, {
    eager: true,
  })
  public accuracyOfPullusAge: AccuracyOfPullusAge;

  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => Condition, m => m.ring, {
    eager: true,
  })
  public condition: Condition;

  @IsNumberString()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => Circumstances, m => m.ring, {
    eager: true,
  })
  public circumstances: Circumstances;

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
  @IsBoolean()
  @Column('boolean', { default: false })
  public verified: boolean;

  public static async create(observation: NewObservation): Promise<Observation> {
    return Object.assign(new Observation(), observation);
  }
}
