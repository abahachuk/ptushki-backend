import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RingBy } from './ring-by-entity';

@Entity()
export class StatusOfRing {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('varchar', { nullable: true, default: null })
  public description: string | null;

  @OneToMany(() => RingBy, ringBy => ringBy.statusOfRing)
  public ringBy: RingBy[];
}
