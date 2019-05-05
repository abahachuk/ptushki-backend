import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToOne(() => Ring, m => m.observation, {
    eager: true,
  })
  public ring: Ring;

  @ManyToOne(() => User, m => m.observation, {
    eager: true,
  })
  public finder: User;

  @ManyToOne(() => Species, m => m.mentionedInObservation, {
    eager: true,
  })
  public speciesMentioned: Species;

  @ManyToOne(() => Species, m => m.concludedInObservation, {
    eager: true,
  })
  public speciesConcluded: Species;

  @ManyToOne(() => Sex, m => m.mentionedInObservation, {
    eager: true,
  })
  public sexMentioned: Sex;

  @ManyToOne(() => Sex, m => m.concludedInObservation, {
    eager: true,
  })
  public sexConcluded: Species;

  @ManyToOne(() => Age, m => m.mentionedInObservation, {
    eager: true,
  })
  public ageMentioned: Age;

  @ManyToOne(() => Age, m => m.concludedInObservation, {
    eager: true,
  })
  public ageConcluded: Age;

  // Related field in access 'Derived data distance'
  @Column('varchar', { nullable: true, default: null })
  public distance: string | null;

  // Related field in access 'Derived data directions'
  @Column('varchar', { nullable: true, default: null })
  public direction: string | null;

  // Related field in access 'Derived data elapsed time'
  @Column('varchar', { nullable: true, default: null })
  public elapsedTime: string | null;

  // Not presented in euring standart
  @Column('varchar', { nullable: true, default: null })
  public colorRing: string | null;

  @ManyToOne(() => Manipulated, m => m.observation, {
    eager: true,
  })
  public manipulated: Manipulated;

  @ManyToOne(() => MovedBeforeTheCapture, m => m.observation, {
    eager: true,
  })
  public movedBeforeTheCapture: MovedBeforeTheCapture;

  @ManyToOne(() => CatchingMethod, m => m.observation, {
    eager: true,
  })
  public catchingMethod: CatchingMethod;

  @ManyToOne(() => CatchingLures, m => m.observation, {
    eager: true,
  })
  public catchingLures: CatchingLures;

  @Column('varchar', { nullable: true, default: null })
  public date: Date | null;

  @ManyToOne(() => AccuracyOfDate, m => m.observation, {
    eager: true,
  })
  public accuracyOfDate: AccuracyOfDate;

  // Related fields in access 'Lat deg', 'Lat min', 'Lat sec', 'Lon deg', 'Lon min', 'Lon sec',
  @Column('varchar', { nullable: true, default: null })
  public geographicalCoordinates: string | null;

  @ManyToOne(() => AccuracyOfCoordinates, m => m.observation, {
    eager: true,
  })
  public accuracyOfCoordinates: AccuracyOfCoordinates;

  @ManyToOne(() => Status, m => m.observation, {
    eager: true,
  })
  public status: Status;

  @ManyToOne(() => PullusAge, m => m.observation, {
    eager: true,
  })
  public pullusAge: PullusAge;

  @ManyToOne(() => AccuracyOfPullusAge, m => m.observation, {
    eager: true,
  })
  public accuracyOfPullusAge: AccuracyOfPullusAge;

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

  // Related fields in access 'Place'
  @Column('varchar', { nullable: true, default: null })
  public placeName: string | null;

  // Related field in access 'Note'
  @Column('varchar', { nullable: true, default: null })
  public remarks: string | null;

  // Not presented in euring standart
  @Column('boolean', { default: false })
  public verified: boolean;

  public static async create(observation: NewObservation): Promise<Observation> {
    return Object.assign(new Observation(), observation);
  }
}
