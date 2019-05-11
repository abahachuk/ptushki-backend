import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Dictionary } from './common-interfaces';
import { Ring } from '../ring-entity';
import { BasaRing } from '../basa-ring-entity';
import { Observation } from '../observation-entity';

// Related tables in access 'Species' and 'Species by Schem'
@Entity()
export class Species implements Dictionary {
  @PrimaryColumn()
  public id: string;

  @Column('varchar', { nullable: true, default: null })
  public letterCode: string | null;

  @Column()
  public species: string;

  @Column('varchar', { nullable: true, default: null })
  public ordo: string | null;

  @Column('varchar', { nullable: true, default: null })
  public family: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string | null;

  @OneToMany(() => Ring, m => m.speciesMentioned)
  public mentionedInRing: Ring[];

  @OneToMany(() => Ring, m => m.speciesConcluded)
  public concludedInRing: Ring[];

  @OneToMany(() => Observation, m => m.speciesMentioned)
  public mentionedInObservation: Observation[];

  @OneToMany(() => Observation, m => m.speciesConcluded)
  public concludedInObservation: Observation[];

  @OneToMany(() => BasaRing, m => m.species)
  public basaRing: BasaRing[];
}
