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
import { Broodsize } from './broodsiz-entity';
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
  @PrimaryGeneratedColumn('uuid') public id: string;

  @ManyToOne(() => RingingScheme, ringingScheme => ringingScheme.ringData)
  public ringingScheme: RingingScheme;

  @ManyToOne(() => EURINGPrimaryIdentificationMethod, primaryIdMethod => primaryIdMethod.ringData)
  public primaryIdMethod: EURINGPrimaryIdentificationMethod;

  @Column({ nullable: true, default: null }) public identification_series: string | null;

  @Column({ nullable: true, default: null }) public dots: string | null;

  @Column({ nullable: true, default: null }) public identification_number: number | null;

  @ManyToOne(() => VerificationOfTheMetalRing, verificationOfTheMetalRing => verificationOfTheMetalRing.ringData)
  public verificationOfTheMetalRing: VerificationOfTheMetalRing;

  @ManyToOne(() => MetalRingInformation, metalRingInformation => metalRingInformation.ringData)
  public metalRingInformation: MetalRingInformation;

  @ManyToOne(() => EURINGOtherMarksInformation, otherMarksInformation => otherMarksInformation.ringData)
  public otherMarksInformation: EURINGOtherMarksInformation;

  @ManyToOne(() => Species, species => species.ringData)
  public species: Species;

  @ManyToOne(() => Manipulated, manipulated => manipulated.ringData)
  public manipulated: Manipulated;

  @ManyToOne(() => MovedBeforeTheCapture, movedBeforeTheCapture => movedBeforeTheCapture.ringData)
  public movedBeforeTheCapture: MovedBeforeTheCapture;

  @ManyToOne(() => CatchingMethod, catchingMethod => catchingMethod.ringData)
  public catchingMethod: CatchingMethod;

  @ManyToOne(() => CathingLures, cathingLures => cathingLures.ringData)
  public cathingLures: CathingLures;

  @ManyToOne(() => Sex, sex => sex.ringData)
  public sex: Sex;

  @ManyToOne(() => Age, age => age.ringData)
  public age: Age;

  @ManyToOne(() => Status, status => status.ringData)
  public status: Status;

  @ManyToOne(() => Broodsize, broodsize => broodsize.ringData)
  public broodsize: Status;

  @ManyToOne(() => PullusAge, pullusAge => pullusAge.ringData)
  public pullusAge: PullusAge;

  @ManyToOne(() => AccuracyOfPullusAge, accuracyOfPullusAge => accuracyOfPullusAge.ringData)
  public accuracyOfPullusAge: AccuracyOfPullusAge;

  @Column({ nullable: true, default: null }) public lng: number | null;

  @Column({ nullable: true, default: null }) public ltd: number | null;

  @ManyToOne(() => PlaceCode, placeCode => placeCode.ringData)
  public placeCode: PlaceCode;

  @ManyToOne(() => AccuracyOfCoords, accuracyOfCoords => accuracyOfCoords.ringData)
  public accuracyOfCoords: AccuracyOfCoords;

  @ManyToOne(() => Condition, condition => condition.ringData)
  public condition: Condition;

  @ManyToOne(() => Circumstances, circumstances => circumstances.ringData)
  public circumstances: Circumstances;

  @ManyToOne(() => CircumstancesPresumed, circumstancesPresumed => circumstancesPresumed.ringData)
  public circumstancesPresumed: CircumstancesPresumed;

  @Column({ nullable: true, default: null }) public date: Date | null;

  @ManyToOne(() => AccuracyOfDate, accuracyOfDate => accuracyOfDate.ringData)
  public accuracyOfDate: AccuracyOfDate;

  @ManyToOne(() => EURINGCodeIdentifier, euringCodeIdentifier => euringCodeIdentifier.ringData)
  public euringCodeIdentifier: EURINGCodeIdentifier;

  @ManyToOne(() => ColorRingInformation, colorRingInformation => colorRingInformation.ringData)
  public colorRingInformation: ColorRingInformation;

  @Column({ nullable: true, default: null }) public derived_data_distance: string | null;

  @Column({ nullable: true, default: null }) public derived_data_direction: string | null;

  @Column({ nullable: true, default: null }) public derived_data_elapsed_time: string | null;

  @Column({ nullable: true, default: null }) public note: string | null;
}
