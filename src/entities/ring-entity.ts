import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import {
  IsUUID,
  Length,
  IsDate,
  IsString,
  IsOptional,
  IsAlpha,
  IsAlphanumeric,
  IsInt,
  Min,
  Max,
  IsNumberString,
} from 'class-validator';
import { equalLength } from '../validation/validation-messages';
import { AccuracyOfCoordinates } from './euring-codes/accuracy-of-coordinates-entity';
import { Sex } from './euring-codes/sex-entity';
import { Age } from './euring-codes/age-entity';
import { RingingScheme } from './euring-codes/ringing-scheme-entity';
import { PrimaryIdentificationMethod } from './euring-codes/primary-identification-method-entity';
import { VerificationOfTheMetalRing } from './euring-codes/verification-of-the-metal-ring-entity';
import { MetalRingInformation } from './euring-codes/metal-ring-information-entity';
import { OtherMarksInformation } from './euring-codes/other-marks-information-entity';
import { Species } from './euring-codes/species-entity';
import { Manipulated } from './euring-codes/manipulated-entity';
import { MovedBeforeTheCapture } from './euring-codes/moved-before-capture-entity';
import { CatchingMethod } from './euring-codes/catching-method-entity';
import { CatchingLures } from './euring-codes/catching-lures-entity';
import { Status } from './euring-codes/status-entity';
import { BroodSize } from './euring-codes/broodsize-entity';
import { PullusAge } from './euring-codes/pullus-age-entity';
import { AccuracyOfPullusAge } from './euring-codes/accuracy-of-pullus-age-entity';
import { PlaceCode } from './euring-codes/place-code-entity';
import { Condition } from './euring-codes/condition-entity';
import { Circumstances } from './euring-codes/circumstances-entity';
import { CircumstancesPresumed } from './euring-codes/circumstances-presumed-entity';
import { AccuracyOfDate } from './euring-codes/accuracy-of-date-entity';
import { EURINGCodeIdentifier } from './euring-codes/euring-code-identifier-entity';
import { User } from './user-entity';
import { StatusOfRing } from './euring-codes/status-of-ring-entity';
import { Observation } from './observation-entity';

@Entity()
export class Ring {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  // Related fields in access 'Ring number', Identification series', 'Dots' and 'Identification number'.
  // Need to sum series, dots and id number in order to get Ring number. See documentation.
  @Length(10, 10, { message: equalLength(10) })
  @Column('varchar')
  public identificationNumber: string;

  @OneToMany(() => Observation, m => m.ring)
  public observation: Observation[];

  @IsAlpha()
  @Length(3, 3, { message: equalLength(3) })
  @ManyToOne(() => RingingScheme, m => m.ring, {
    eager: true,
  })
  public ringingScheme: RingingScheme;

  @IsAlphanumeric()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => PrimaryIdentificationMethod, m => m.ring, {
    eager: true,
  })
  public primaryIdentificationMethod: PrimaryIdentificationMethod;

  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => VerificationOfTheMetalRing, m => m.ring, {
    eager: true,
  })
  public verificationOfTheMetalRing: VerificationOfTheMetalRing;

  @IsInt()
  @Min(0)
  @Max(7)
  @ManyToOne(() => MetalRingInformation, m => m.ring, {
    eager: true,
  })
  public metalRingInformation: MetalRingInformation;

  @IsAlpha()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => OtherMarksInformation, m => m.ring, {
    eager: true,
  })
  public otherMarksInformation: OtherMarksInformation;

  @IsNumberString()
  @Length(5, 5, { message: equalLength(5) })
  @ManyToOne(() => Species, m => m.mentionedInRing, {
    eager: true,
  })
  public speciesMentioned: Species;

  @IsNumberString()
  @Length(5, 5, { message: equalLength(5) })
  @ManyToOne(() => Species, m => m.concludedInRing, {
    eager: true,
  })
  public speciesConcluded: Species;

  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Manipulated, m => m.ring, {
    eager: true,
  })
  public manipulated: Manipulated;

  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => MovedBeforeTheCapture, m => m.ring, {
    eager: true,
  })
  public movedBeforeTheCapture: MovedBeforeTheCapture;

  @IsOptional()
  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => CatchingMethod, m => m.ring, {
    eager: true,
  })
  public catchingMethod: CatchingMethod;

  @IsOptional()
  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => CatchingLures, m => m.ring, {
    eager: true,
  })
  public catchingLures: CatchingLures;

  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Sex, m => m.mentionedInRing, {
    eager: true,
  })
  public sexMentioned: Sex;

  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Sex, m => m.concludedInRing, {
    eager: true,
  })
  public sexConcluded: Sex;

  @IsAlphanumeric()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Age, m => m.mentionedInRing, {
    eager: true,
  })
  public ageMentioned: Age;

  @IsAlphanumeric()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Age, m => m.concludedInRing, {
    eager: true,
  })
  public ageConcluded: Age;

  @IsOptional()
  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Status, m => m.ring, {
    eager: true,
  })
  public status: Status;

  @IsOptional()
  @IsNumberString()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => BroodSize, m => m.ring, {
    eager: true,
  })
  public broodSize: BroodSize;

  @IsOptional()
  @IsNumberString()
  @Length(2, 2, { message: equalLength(2) })
  @ManyToOne(() => PullusAge, m => m.ring, {
    eager: true,
  })
  public pullusAge: PullusAge;

  @IsOptional()
  @IsAlphanumeric()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => AccuracyOfPullusAge, m => m.ring, {
    eager: true,
  })
  public accuracyOfPullusAge: AccuracyOfPullusAge;

  // Related fields in access 'Lat deg', 'Lat min', 'Lat sec', 'Lon deg', 'Lon min', 'Lon sec',
  @Length(15, 15, { message: equalLength(15) })
  @Column('varchar', { nullable: true, default: null })
  public geographicalCoordinates: string | null;

  @IsAlphanumeric()
  @Length(4, 4, { message: equalLength(4) })
  @ManyToOne(() => PlaceCode, m => m.ring, {
    eager: true,
  })
  public placeCode: PlaceCode;

  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => AccuracyOfCoordinates, m => m.ring, {
    eager: true,
  })
  public accuracyOfCoordinates: AccuracyOfCoordinates;

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

  @IsDate()
  @Column('varchar', { nullable: true, default: null })
  public date: Date | null;

  @IsInt()
  @Min(0)
  @Max(9)
  @ManyToOne(() => AccuracyOfDate, m => m.ring, {
    eager: true,
  })
  public accuracyOfDate: AccuracyOfDate;

  @IsInt()
  @Min(0)
  @Max(4)
  @ManyToOne(() => EURINGCodeIdentifier, m => m.ring, {
    eager: true,
  })
  public euringCodeIdentifier: EURINGCodeIdentifier;

  // Related field in access 'Note'
  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public remarks: string | null;

  // Not presented in euring standart
  @IsUUID()
  @ManyToOne(() => User, m => m.ring, {
    eager: true,
  })
  public ringerInformation: User;

  // Not presented in euring standart
  @IsOptional()
  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => StatusOfRing, m => m.ring, {
    eager: true,
  })
  public statusOfRing: StatusOfRing;
}
