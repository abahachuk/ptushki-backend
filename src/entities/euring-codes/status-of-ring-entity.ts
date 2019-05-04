import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Ring } from '../ring-entity';

// Related table in access 'Status of ring'
@Entity()
export class StatusOfRing {
  @PrimaryColumn()
  public id: string;

  @Column('varchar', { nullable: true, default: null })
  public description: string | null;

  @OneToMany(() => Ring, m => m.statusOfRing)
  public ring: Ring[];
}
