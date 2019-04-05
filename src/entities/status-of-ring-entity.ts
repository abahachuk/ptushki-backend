import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RingBy } from './ring-by-entity';

@Entity()
export class StatusOfRing {
  @PrimaryGeneratedColumn('uuid') public id: string;

  @Column() public description: string | null;

  @OneToMany(() => RingBy, ringBy => ringBy.statusOfRing)
  public ringBy: RingBy[];
}
