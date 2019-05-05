import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
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
  @Column('varchar')
  public identificationNumber: string;

  @OneToMany(() => Observation, m => m.ring)
  public observation: Observation[];

  @ManyToOne(() => RingingScheme, m => m.ring, {
    eager: true,
  })
  public ringingScheme: RingingScheme;

  @ManyToOne(() => PrimaryIdentificationMethod, m => m.ring, {
    eager: true,
  })
  public primaryIdentificationMethod: PrimaryIdentificationMethod;

  @ManyToOne(() => VerificationOfTheMetalRing, m => m.ring, {
    eager: true,
  })
  public verificationOfTheMetalRing: VerificationOfTheMetalRing;

  @ManyToOne(() => MetalRingInformation, m => m.ring, {
    eager: true,
  })
  public metalRingInformation: MetalRingInformation;

  @ManyToOne(() => OtherMarksInformation, m => m.ring, {
    eager: true,
  })
  public otherMarksInformation: OtherMarksInformation;

  @ManyToOne(() => Species, m => m.mentionedInRing, {
    eager: true,
  })
  public speciesMentioned: Species;

  @ManyToOne(() => Species, m => m.concludedInRing, {
    eager: true,
  })
  public speciesConcluded: Species;

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

  @ManyToOne(() => Sex, m => m.mentionedInRing, {
    eager: true,
  })
  public sexMentioned: Sex;

  @ManyToOne(() => Sex, m => m.concludedInRing, {
    eager: true,
  })
  public sexConcluded: Sex;

  @ManyToOne(() => Age, m => m.mentionedInRing, {
    eager: true,
  })
  public ageMentioned: Age;

  @ManyToOne(() => Age, m => m.concludedInRing, {
    eager: true,
  })
  public ageConcluded: Age;

  @ManyToOne(() => Status, m => m.ring, {
    eager: true,
  })
  public status: Status;

  @ManyToOne(() => BroodSize, m => m.ring, {
    eager: true,
  })
  public broodSize: BroodSize;

  @ManyToOne(() => PullusAge, m => m.ring, {
    eager: true,
  })
  public pullusAge: PullusAge;

  @ManyToOne(() => AccuracyOfPullusAge, m => m.ring, {
    eager: true,
  })
  public accuracyOfPullusAge: AccuracyOfPullusAge;

  // Related fields in access 'Lat deg', 'Lat min', 'Lat sec', 'Lon deg', 'Lon min', 'Lon sec',
  @Column('varchar', { nullable: true, default: null })
  public geographicalCoordinates: string | null;

  @ManyToOne(() => PlaceCode, m => m.ring, {
    eager: true,
  })
  public placeCode: PlaceCode;

  @ManyToOne(() => AccuracyOfCoordinates, m => m.ring, {
    eager: true,
  })
  public accuracyOfCoordinates: AccuracyOfCoordinates;

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

  // Related field in access 'Note'
  @Column('varchar', { nullable: true, default: null })
  public remarks: string | null;

  // Not presented in euring standart
  @ManyToOne(() => User, m => m.ring, {
    eager: true,
  })
  public ringerInformation: User;

  // Not presented in euring standart
  @ManyToOne(() => StatusOfRing, m => m.ring, {
    eager: true,
  })
  public statusOfRing: StatusOfRing;
}
