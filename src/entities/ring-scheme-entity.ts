import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RingData } from './ring-data-entity';

@Entity()
export class RingingScheme {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public code: string;

  // < --- can be primary and check if it could be ID
  @Column('varchar', { nullable: true, default: null })
  public status: string;

  @Column('varchar', { nullable: true, default: null })
  public country: string | null;

  @Column('varchar', { nullable: true, default: null })
  public center: string | null;

  @OneToMany(() => RingData, ringData => ringData.ringingScheme)
  public ringData: RingData[];
}
