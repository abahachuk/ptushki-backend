import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Dictionary } from './common-interfaces';
import { Ring } from '../ring-entity';
import { Observation } from '../observation-entity';

// Related table in access 'Manipulated'
@Entity()
export class Manipulated implements Dictionary {
  @PrimaryColumn()
  public id: string;

  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string | null;

  @OneToMany(() => Ring, m => m.manipulated)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.manipulated)
  public observation: Observation[];
}