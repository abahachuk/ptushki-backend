import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user-entity';
import { Ring } from './ring-entity';
import { Sex } from './euring-codes/sex-entity';
import { Age } from './euring-codes/age-entity';
import { Species } from './euring-codes/species-entity';

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

  @ManyToOne(() => Species, m => m.observation, {
    eager: true,
  })
  public speciesMentioned: Species;

  @ManyToOne(() => Sex, m => m.observation, {
    eager: true,
  })
  public sexMentioned: Sex;

  @ManyToOne(() => Age, m => m.observation, {
    eager: true,
  })
  public ageMentioned: Age;

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

  // Related field in access 'Note'
  @Column('varchar', { nullable: true, default: null })
  public remarks: string | null;

  // Not presented in euring standart
  @Column('boolean', { default: false })
  public verified: boolean;
}
