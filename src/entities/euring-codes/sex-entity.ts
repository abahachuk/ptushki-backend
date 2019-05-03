import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Dictionary } from './common-interfaces';
import { Ring } from '../ring-entity';
import { BasaRing } from '../basa-ring-entity';
import { Observation } from '../observation-entity';

// Related tables in access 'Sex' and 'Sex by schem'
@Entity()
export class Sex implements Dictionary {
  @PrimaryColumn()
  public id: string;

  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string | null;

  @OneToMany(() => Ring, m => m.sexMentioned)
  public mentionedInRing: Ring[];

  @OneToMany(() => Ring, m => m.sexConcluded)
  public concludedInRing: Ring[];

  @OneToMany(() => Observation, m => m.sexMentioned)
  public mentionedInObservation: Observation[];

  @OneToMany(() => Observation, m => m.sexConcluded)
  public concludedInObservation: Observation[];

  @OneToMany(() => BasaRing, m => m.species)
  public basaRing: BasaRing[];
}
