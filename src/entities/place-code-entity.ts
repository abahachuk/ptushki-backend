import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Ring } from './ring-entity';

@Entity()
export class PlaceCode {
  @PrimaryColumn()
  public id: string;

  @Column('varchar', { nullable: true, default: null })
  public country: string | null;

  @Column('varchar', { nullable: true, default: null })
  public region: string | null;

  @OneToMany(() => Ring, m => m.placeCode)
  public ring: Ring[];
}
