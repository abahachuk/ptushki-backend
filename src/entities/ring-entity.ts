import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { AccuracyOfCoords } from './accuracy-of-coords-intity';
import { Sex } from './sex-entity';
import { Age } from './age-entity';
import { RingingScheme } from './ring-scheme-entity';
import { EURINGPrimaryIdentificationMethod } from './euring-primary-identification-method-entity';
import { VerificationOfTheMetalRing } from './verification-of-metal-ring-entity';
import { MetalRingInformation } from './metal-ring-information-entity';
import { EURINGOtherMarksInformation } from './euring-other-marks-information-entity';
import { Species } from './species-entity';
import { Manipulated } from './manipulated-entity';
import { MovedBeforeTheCapture } from './moved-before-capture-entity';
import { CatchingMethod } from './catching-method-entity';
import { CathingLures } from './catching-lures-entity';
import { Status } from './status-entity';
import { Broodsize } from './broodsize-entity';
import { PullusAge } from './pullus-age-entity';
import { AccuracyOfPullusAge } from './accuracy-of-pullus-age-entity';
import { PlaceCode } from './place-code-entity';
import { Condition } from './condition-entity';
import { Circumstances } from './circumstances-entity';
import { CircumstancesPresumed } from './circumstances-presumed-entity';
import { AccuracyOfDate } from './accuracy-of-date-entity';
import { EURINGCodeIdentifier } from './euring-code-identifier-entity';
import { ColorRingInformation } from './color-ring-information-entity';
import { User } from './user-entity';
import { StatusOfRing } from './status-of-ring-entity';
import { Observation } from './observation-entity';

@Entity()
export class Ring {
  @PrimaryColumn()
  public id: string;

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

  @ManyToOne(() => ColorRingInformation, m => m.ring)
  public colorRingInformation: ColorRingInformation;

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
