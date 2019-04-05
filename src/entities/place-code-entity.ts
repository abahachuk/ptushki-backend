import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RingData } from './ring-data-entity';

@Entity()
export class PlaceCode {
  @PrimaryGeneratedColumn('uuid') public id: string;

  @Column() public code: string;

  // < --- can be primary and check if it could be ID
  @Column({ nullable: true, default: null }) public country: string | null;

  @Column({ nullable: true, default: null }) public region: string | null;

  @OneToMany(() => RingData, ringData => ringData.placeCode)
  public ringData: RingData[];
}
