import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Species } from './euring-codes/species-entity';
import { Sex } from './euring-codes/sex-entity';
import { Age } from './euring-codes/age-entity';
import { User } from './user-entity';

@Entity()
export class BasaRing {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('varchar')
  public ringNumber: string;

  @ManyToOne(() => Species, m => m.basaRing, {
    eager: true,
  })
  public species: Species;

  @ManyToOne(() => Sex, m => m.basaRing, {
    eager: true,
  })
  public sex: Sex;

  @ManyToOne(() => Age, m => m.basaRing, {
    eager: true,
  })
  public age: Age;

  @ManyToOne(() => User, m => m.basaRing, {
    eager: true,
  })
  public ringer: User;

  @Column('varchar', { nullable: true, default: null })
  public region: string | null;

  @Column('varchar', { nullable: true, default: null })
  public district: string | null;

  @Column('varchar', { nullable: true, default: null })
  public place: string | null;

  @Column('varchar', { nullable: true, default: null })
  public coordinates: string | null;

  @Column('varchar', { nullable: true, default: null })
  public note: string | null;
}
