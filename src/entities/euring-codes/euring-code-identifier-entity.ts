import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Dictionary } from './common-interfaces';
import { Ring } from '../ring-entity';

// Related table in access 'Euring cod identifier'
@Entity()
export class EURINGCodeIdentifier implements Dictionary {
  @PrimaryColumn()
  public id: number;

  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string | null;

  @OneToMany(() => Ring, m => m.euringCodeIdentifier)
  public ring: Ring[];
}
