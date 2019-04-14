import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { RingData } from './ring-data-entity';

@Entity()
export class PlaceCode {
  @PrimaryColumn()
  public id: string;

  @Column('varchar', { nullable: true, default: null })
  public country: string | null;

  @Column('varchar', { nullable: true, default: null })
  public region: string | null;

  @OneToMany(() => RingData, m => m.placeCode)
  public ringData: RingData[];
}
