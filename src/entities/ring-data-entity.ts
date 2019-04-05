import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
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

@Entity()
export class RingData {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => RingingScheme, m => m.ringData)
  public ringingScheme: RingingScheme;

  @ManyToOne(() => EURINGPrimaryIdentificationMethod, m => m.ringData)
  public primaryIdMethod: EURINGPrimaryIdentificationMethod;

  @Column('varchar', { nullable: true, default: null })
  public identification_series: string | null;

  @Column('varchar', { nullable: true, default: null })
  public dots: string | null;

  @Column('varchar', { nullable: true, default: null })
  public identification_number: number | null;

  @ManyToOne(() => VerificationOfTheMetalRing, m => m.ringData)
  public verificationOfTheMetalRing: VerificationOfTheMetalRing;

  @ManyToOne(() => MetalRingInformation, m => m.ringData)
  public metalRingInformation: MetalRingInformation;

  @ManyToOne(() => EURINGOtherMarksInformation, m => m.ringData)
  public otherMarksInformation: EURINGOtherMarksInformation;

  @ManyToOne(() => Species, m => m.ringData)
  public species: Species;

  @ManyToOne(() => Manipulated, m => m.ringData)
  public manipulated: Manipulated;

  @ManyToOne(() => MovedBeforeTheCapture, m => m.ringData)
  public movedBeforeTheCapture: MovedBeforeTheCapture;

  @ManyToOne(() => CatchingMethod, m => m.ringData)
  public catchingMethod: CatchingMethod;

  @ManyToOne(() => CathingLures, m => m.ringData)
  public cathingLures: CathingLures;

  @ManyToOne(() => Sex, m => m.ringData)
  public sex: Sex;

  @ManyToOne(() => Age, m => m.ringData)
  public age: Age;

  @ManyToOne(() => Status, m => m.ringData)
  public status: Status;

  @ManyToOne(() => Broodsize, m => m.ringData)
  public broodsize: Status;

  @ManyToOne(() => PullusAge, m => m.ringData)
  public pullusAge: PullusAge;

  @ManyToOne(() => AccuracyOfPullusAge, m => m.ringData)
  public accuracyOfPullusAge: AccuracyOfPullusAge;

  @Column('varchar', { nullable: true, default: null })
  public lng: number | null;

  @Column('varchar', { nullable: true, default: null })
  public ltd: number | null;

  @ManyToOne(() => PlaceCode, m => m.ringData)
  public placeCode: PlaceCode;

  @ManyToOne(() => AccuracyOfCoords, m => m.ringData)
  public accuracyOfCoords: AccuracyOfCoords;

  @ManyToOne(() => Condition, m => m.ringData)
  public condition: Condition;

  @ManyToOne(() => Circumstances, m => m.ringData)
  public circumstances: Circumstances;

  @ManyToOne(() => CircumstancesPresumed, m => m.ringData)
  public circumstancesPresumed: CircumstancesPresumed;

  @Column('varchar', { nullable: true, default: null })
  public date: Date | null;

  @ManyToOne(() => AccuracyOfDate, m => m.ringData)
  public accuracyOfDate: AccuracyOfDate;

  @ManyToOne(() => EURINGCodeIdentifier, m => m.ringData)
  public euringCodeIdentifier: EURINGCodeIdentifier;

  @ManyToOne(() => ColorRingInformation, m => m.ringData)
  public colorRingInformation: ColorRingInformation;

  @Column('varchar', { nullable: true, default: null })
  public derived_data_distance: string | null;

  @Column('varchar', { nullable: true, default: null })
  public derived_data_direction: string | null;

  @Column('varchar', { nullable: true, default: null })
  public derived_data_elapsed_time: string | null;

  @Column('varchar', { nullable: true, default: null })
  public note: string | null;
}
