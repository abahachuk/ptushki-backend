import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Dictionary } from './common-interfaces';
import { Ring } from '../ring-entity';
import { Observation } from '../observation-entity';

// Related table in access 'Condition'
@Entity()
export class Condition implements Dictionary {
  @PrimaryColumn()
  public id: number;

  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string | null;

  @OneToMany(() => Ring, m => m.condition)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.condition)
  public observation: Observation[];
}
