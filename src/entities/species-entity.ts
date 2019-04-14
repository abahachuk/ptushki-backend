import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { RingData } from './ring-data-entity';
import { BasaRing } from './basa-ring-entity';

@Entity()
export class Species {
  @PrimaryColumn()
  public id: number;

  @Column('varchar', { nullable: true, default: null })
  public six_l_code: string | null;

  @Column('varchar', { nullable: true, default: null })
  public species: string | null;

  @Column('varchar', { nullable: true, default: null })
  public ordo: string | null;

  @Column('varchar', { nullable: true, default: null })
  public family: string | null;

  @OneToMany(() => RingData, m => m.species)
  public ringData: RingData[];

  @OneToMany(() => BasaRing, m => m.species)
  public basaRing: BasaRing[];
}
