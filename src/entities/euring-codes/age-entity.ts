import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Dictionary } from './common-interfaces';
import { Ring } from '../ring-entity';
import { BasaRing } from '../basa-ring-entity';
import { Observation } from '../observation-entity';

// Related tables in access are 'Age' and 'Age by Schem' (they are similar)
@Entity()
export class Age implements Dictionary {
  @PrimaryColumn()
  public id: string;

  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string | null;

  @OneToMany(() => Ring, m => m.ageMentioned)
  public mentionedInRing: Ring[];

  @OneToMany(() => Ring, m => m.ageConcluded)
  public concludedInRing: Ring[];

  @OneToMany(() => Observation, m => m.ageMentioned)
  public mentionedInObservation: Observation[];

  @OneToMany(() => Observation, m => m.ageConcluded)
  public concludedInObservation: Observation[];

  @OneToMany(() => BasaRing, m => m.age)
  public basaRing: BasaRing[];
}
