import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { AccuracyOfCoords } from './euring-codes/accuracy-of-coordinates-entity';
import { Sex } from './euring-codes/sex-entity';
import { Age } from './euring-codes/age-entity';
import { RingingScheme } from './euring-codes/ringing-scheme-entity';
import { EURINGPrimaryIdentificationMethod } from './euring-codes/primary-identification-method-entity';
import { VerificationOfTheMetalRing } from './euring-codes/verification-of-the-metal-ring-entity';
import { MetalRingInformation } from './euring-codes/metal-ring-information-entity';
import { EURINGOtherMarksInformation } from './euring-codes/other-marks-information-entity';
import { Species } from './euring-codes/species-entity';
import { Manipulated } from './euring-codes/manipulated-entity';
import { MovedBeforeTheCapture } from './euring-codes/moved-before-capture-entity';
import { CatchingMethod } from './euring-codes/catching-method-entity';
import { CatchingLures } from './euring-codes/catching-lures-entity';
import { Status } from './euring-codes/status-entity';
import { Broodsize } from './euring-codes/broodsize-entity';
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

  @Column('varchar')
  public ringNumber: string;

  @OneToMany(() => Observation, m => m.ring)
  public observation: Observation[];

  @ManyToOne(() => RingingScheme, m => m.ring, {
    eager: true,
  })
  public ringingScheme: RingingScheme;

  @ManyToOne(() => EURINGPrimaryIdentificationMethod, m => m.ring, {
    eager: true,
  })
  public euringPrimaryIdMethod: EURINGPrimaryIdentificationMethod;

  @Column('varchar', { nullable: true, default: null })
  public identificationSeries: string | null;

  @Column('varchar', { nullable: true, default: null })
  public dots: string | null;

  @Column('varchar', { nullable: true, default: null })
  public identificationNumber: number | null;

  @ManyToOne(() => VerificationOfTheMetalRing, m => m.ring, {
    eager: true,
  })
  public verificationOfTheMetalRing: VerificationOfTheMetalRing;

  @ManyToOne(() => MetalRingInformation, m => m.ring, {
    eager: true,
  })
  public metalRingInformation: MetalRingInformation;

  @ManyToOne(() => EURINGOtherMarksInformation, m => m.ring, {
    eager: true,
  })
  public euringOtherMarksInformation: EURINGOtherMarksInformation;

  @ManyToOne(() => Species, m => m.ring, {
    eager: true,
  })
  public speciesScheme: Species;

  @ManyToOne(() => Manipulated, m => m.ring, {
    eager: true,
  })
  public manipulated: Manipulated;

  @ManyToOne(() => MovedBeforeTheCapture, m => m.ring, {
    eager: true,
  })
  public movedBeforeTheCapture: MovedBeforeTheCapture;

  @ManyToOne(() => CatchingMethod, m => m.ring, {
    eager: true,
  })
  public catchingMethod: CatchingMethod;

  @ManyToOne(() => CatchingLures, m => m.ring, {
    eager: true,
  })
  public catchingLures: CatchingLures;

  @ManyToOne(() => Sex, m => m.ring, {
    eager: true,
  })
  public sexScheme: Sex;

  @ManyToOne(() => Age, m => m.ring, {
    eager: true,
  })
  public ageScheme: Age;

  @ManyToOne(() => Status, m => m.ring, {
    eager: true,
  })
  public status: Status;

  @ManyToOne(() => Broodsize, m => m.ring, {
    eager: true,
  })
  public broodsize: Broodsize;

  @ManyToOne(() => PullusAge, m => m.ring, {
    eager: true,
  })
  public pullusAge: PullusAge;

  @ManyToOne(() => AccuracyOfPullusAge, m => m.ring, {
    eager: true,
  })
  public accuracyOfPullusAge: AccuracyOfPullusAge;

  @Column('varchar', { nullable: true, default: null })
  public coordinates: string;

  @ManyToOne(() => PlaceCode, m => m.ring, {
    eager: true,
  })
  public placeCode: PlaceCode;

  @ManyToOne(() => AccuracyOfCoords, m => m.ring, {
    eager: true,
  })
  public accuracyOfCoords: AccuracyOfCoords;

  @ManyToOne(() => Condition, m => m.ring, {
    eager: true,
  })
  public condition: Condition;

  @ManyToOne(() => Circumstances, m => m.ring, {
    eager: true,
  })
  public circumstances: Circumstances;

  @ManyToOne(() => CircumstancesPresumed, m => m.ring, {
    eager: true,
  })
  public circumstancesPresumed: CircumstancesPresumed;

  @Column('varchar', { nullable: true, default: null })
  public date: Date | null;

  @ManyToOne(() => AccuracyOfDate, m => m.ring, {
    eager: true,
  })
  public accuracyOfDate: AccuracyOfDate;

  @ManyToOne(() => EURINGCodeIdentifier, m => m.ring, {
    eager: true,
  })
  public euringCodeIdentifier: EURINGCodeIdentifier;

  @Column('varchar', { nullable: true, default: null })
  public derivedDataDistance: string | null;

  @Column('varchar', { nullable: true, default: null })
  public derivedDataDirection: string | null;

  @Column('varchar', { nullable: true, default: null })
  public derivedDataElapsedTime: string | null;

  @Column('varchar', { nullable: true, default: null })
  public note: string | null;

  @ManyToOne(() => User, m => m.ring, {
    eager: true,
  })
  public ringerInformation: User;

  @ManyToOne(() => StatusOfRing, m => m.ring, {
    eager: true,
  })
  public statusOfRing: StatusOfRing;
}
