import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Ring } from './ring-entity';

@Entity()
export class ColorRingInformation {
  @PrimaryColumn()
  public id: string;

  @Column('varchar', { nullable: true, default: null })
  public schem: string | null;

  @Column('varchar', { nullable: true, default: null })
  public descr: string | null;

  @Column('varchar', { nullable: true, default: null })
  public pic: string | null;

  @OneToMany(() => Ring, m => m.colorRingInformation)
  public ring: Ring[];
}
