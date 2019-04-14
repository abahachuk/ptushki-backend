import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Ring } from './ring-entity';

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

  @OneToMany(() => Ring, m => m.ringingScheme)
  public ring: Ring[];
}
