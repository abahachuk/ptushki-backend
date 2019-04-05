import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Species } from './species-entity';
import { Sex } from './sex-entity';
import { Age } from './age-entity';
import { User } from './user-entity';

@Entity()
export class BasaRing {
  @PrimaryGeneratedColumn('uuid') public id: string;

  @ManyToOne(() => Species, species => species.basaRing)
  public species: Species;

  @ManyToOne(() => Sex, sex => sex.basaRing)
  public sex: Sex;

  @ManyToOne(() => Age, age => age.basaRing)
  public age: Age;

  @ManyToOne(() => User, ringer => ringer.basaRing)
  public ringer: User;

  @Column({ nullable: true, default: null }) public region: string | null;

  @Column({ nullable: true, default: null }) public district: string | null;

  @Column({ nullable: true, default: null }) public place: string | null;

  @Column({ nullable: true, default: null }) public coordinates: string | null;

  @Column({ nullable: true, default: null }) public lat: string | null;

  @Column({ nullable: true, default: null }) public lon: string | null;

  @Column({ nullable: true, default: null }) public co_la_de: string | null;

  @Column({ nullable: true, default: null }) public co_la_mi: string | null;

  @Column({ nullable: true, default: null }) public co_lo_de: string | null;

  @Column({ nullable: true, default: null }) public co_lo_mi: string | null;

  @Column({ nullable: true, default: null }) public map: string | null;

  @Column({ nullable: true, default: null }) public notes: string | null;
}
