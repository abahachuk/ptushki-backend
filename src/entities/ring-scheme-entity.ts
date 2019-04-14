import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { RingData } from './ring-data-entity';

@Entity()
export class RingingScheme {
  @PrimaryColumn()
  public id: string;

  @Column('varchar', { nullable: true, default: null })
  public status: string;

  @Column('varchar', { nullable: true, default: null })
  public country: string | null;

  @Column('varchar', { nullable: true, default: null })
  public center: string | null;

  @OneToMany(() => RingData, m => m.ringingScheme)
  public ringData: RingData[];
}
