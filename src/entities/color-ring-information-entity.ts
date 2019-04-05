import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RingData } from './ring-data-entity';

@Entity()
export class ColorRingInformation {
  @PrimaryGeneratedColumn('uuid') public id: string;

  @Column() public short_schem: string;

  // < --- can be primary and check if it could be ID
  @Column({ nullable: true, default: null }) public schem: string | null;

  @Column({ nullable: true, default: null }) public descr: string | null;

  @Column({ nullable: true, default: null }) public pic: any;

  // < -- не известно.
  @OneToMany(() => RingData, ringData => ringData.colorRingInformation)
  public ringData: RingData[];
}
