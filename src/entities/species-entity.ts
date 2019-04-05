import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RingData } from './ring-data-entity';
import { BasaRing } from './basa-ring-entity';

@Entity()
export class Species {
  @PrimaryGeneratedColumn('uuid') public id: string;

  @Column() public euring_code: number;

  // < --- can be primary and check if it could be ID
  @Column('varchar', { nullable: true, default: null }) public six_l_code: string | null;

  @Column('varchar', { nullable: true, default: null }) public species: string | null;

  @Column('varchar', { nullable: true, default: null }) public ordo: string | null;

  @Column('varchar', { nullable: true, default: null }) public family: string | null;

  @OneToMany(() => RingData, ringData => ringData.species)
  public ringData: RingData[];

  @OneToMany(() => BasaRing, basaRing => basaRing.species)
  public basaRing: BasaRing[];
}
