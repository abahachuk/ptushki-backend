import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Ring } from './ring-entity';
import { BasaRing } from './basa-ring-entity';
import { Observation } from './observation-entity';

@Entity()
export class Species {
  @PrimaryColumn()
  public id: number;

  @Column('varchar', { nullable: true, default: null })
  public belCode: number;

  @Column('varchar', { nullable: true, default: null })
  public species: string | null;

  @Column('varchar', { nullable: true, default: null })
  public ordo: string | null;

  @Column('varchar', { nullable: true, default: null })
  public family: string | null;

  @OneToMany(() => Ring, m => m.speciesScheme)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.speciesMentioned)
  public observation: Observation[];

  @OneToMany(() => BasaRing, m => m.species)
  public basaRing: BasaRing[];
}
