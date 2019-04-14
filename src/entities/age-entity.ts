import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Dictionary } from './common-interfaces';
import { Ring } from './ring-entity';
import { BasaRing } from './basa-ring-entity';
import { Observation } from './observation-entity';

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

  @OneToMany(() => Ring, m => m.ageScheme)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.speciesMentioned)
  public observation: Observation[];

  @OneToMany(() => BasaRing, m => m.age)
  public basaRing: BasaRing[];
}
