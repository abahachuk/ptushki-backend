import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { AccuracyOfCoords } from './euring-codes/accuracy-of-coords-intity';
import { Sex } from './euring-codes/sex-entity';
import { Age } from './euring-codes/age-entity';
import { RingingScheme } from './euring-codes/ring-scheme-entity';
import { EURINGPrimaryIdentificationMethod } from './euring-codes/euring-primary-identification-method-entity';
import { VerificationOfTheMetalRing } from './euring-codes/verification-of-metal-ring-entity';
import { MetalRingInformation } from './euring-codes/metal-ring-information-entity';
import { EURINGOtherMarksInformation } from './euring-codes/euring-other-marks-information-entity';
import { Species } from './euring-codes/species-entity';
import { Manipulated } from './euring-codes/manipulated-entity';
import { MovedBeforeTheCapture } from './euring-codes/moved-before-capture-entity';
import { CatchingMethod } from './euring-codes/catching-method-entity';
import { CathingLures } from './euring-codes/catching-lures-entity';
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

  @ManyToOne(() => RingingScheme, m => m.ring)
  public ringingScheme: RingingScheme;

  @ManyToOne(() => EURINGPrimaryIdentificationMethod, m => m.ring)
  public euringPrimaryIdMethod: EURINGPrimaryIdentificationMethod;

  @Column('varchar', { nullable: true, default: null })
  public identificationSeries: string | null;

  @Column('varchar', { nullable: true, default: null })
  public dots: string | null;

  @Column('varchar', { nullable: true, default: null })
  public identificationNumber: number | null;

  @ManyToOne(() => VerificationOfTheMetalRing, m => m.ring)
  public verificationOfTheMetalRing: VerificationOfTheMetalRing;

  @ManyToOne(() => MetalRingInformation, m => m.ring)
  public metalRingInformation: MetalRingInformation;

  @ManyToOne(() => EURINGOtherMarksInformation, m => m.ring)
  public euringOtherMarksInformation: EURINGOtherMarksInformation;

  @ManyToOne(() => Species, m => m.ring)
  public speciesScheme: Species;

  @ManyToOne(() => Manipulated, m => m.ring)
  public manipulated: Manipulated;

  @ManyToOne(() => MovedBeforeTheCapture, m => m.ring)
  public movedBeforeTheCapture: MovedBeforeTheCapture;

  @ManyToOne(() => CatchingMethod, m => m.ring)
  public catchingMethod: CatchingMethod;

  @ManyToOne(() => CathingLures, m => m.ring)
  public cathingLures: CathingLures;

  @ManyToOne(() => Sex, m => m.ring)
  public sexScheme: Sex;

  @ManyToOne(() => Age, m => m.ring)
  public ageScheme: Age;

  @ManyToOne(() => Status, m => m.ring)
  public status: Status;

  @ManyToOne(() => Broodsize, m => m.ring)
  public broodsize: Broodsize;

  @ManyToOne(() => PullusAge, m => m.ring)
  public pullusAge: PullusAge;

  @ManyToOne(() => AccuracyOfPullusAge, m => m.ring)
  public accuracyOfPullusAge: AccuracyOfPullusAge;

  @Column('varchar', { nullable: true, default: null })
  public coordinates: string;

  @ManyToOne(() => PlaceCode, m => m.ring)
  public placeCode: PlaceCode;

  @ManyToOne(() => AccuracyOfCoords, m => m.ring)
  public accuracyOfCoords: AccuracyOfCoords;

  @ManyToOne(() => Condition, m => m.ring)
  public condition: Condition;

  @ManyToOne(() => Circumstances, m => m.ring)
  public circumstances: Circumstances;

  @ManyToOne(() => CircumstancesPresumed, m => m.ring)
  public circumstancesPresumed: CircumstancesPresumed;

  @Column('varchar', { nullable: true, default: null })
  public date: Date | null;

  @ManyToOne(() => AccuracyOfDate, m => m.ring)
  public accuracyOfDate: AccuracyOfDate;

  @ManyToOne(() => EURINGCodeIdentifier, m => m.ring)
  public euringCodeIdentifier: EURINGCodeIdentifier;

  @Column('varchar', { nullable: true, default: null })
  public derivedDataDistance: string | null;

  @Column('varchar', { nullable: true, default: null })
  public derivedDataDirection: string | null;

  @Column('varchar', { nullable: true, default: null })
  public derivedDataElapsedTime: string | null;

  @Column('varchar', { nullable: true, default: null })
  public note: string | null;

  @ManyToOne(() => User, m => m.ring)
  public ringerInformation: User;

  @ManyToOne(() => StatusOfRing, m => m.ring)
  public statusOfRing: StatusOfRing;
}
