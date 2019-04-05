import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Dictionary } from './common-interfaces';
import { RingData } from './ring-data-entity';

@Entity()
export class Manipulated implements Dictionary {
  @PrimaryGeneratedColumn('uuid') public id: string;

  @Column({ nullable: true, default: null }) public desc_eng: string | null;

  @Column({ nullable: true, default: null }) public desc_rus: string | null;

  @Column({ nullable: true, default: null }) public desc_byn: string | null;

  @OneToMany(() => RingData, ringData => ringData.manipulated)
  public ringData: RingData[];
}
