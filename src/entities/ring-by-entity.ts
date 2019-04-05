import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { RingData } from './ring-data-entity';
import { User } from './user-entity';
import { StatusOfRing } from './status-of-ring-entity';

@Entity()
export class RingBy {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToOne(() => RingData)
  @JoinColumn()
  public ringData: RingData;

  @ManyToOne(() => User, m => m.ringBy)
  public ringerInformation: User;

  @ManyToOne(() => StatusOfRing, m => m.ringBy)
  public statusOfRing: StatusOfRing;
}
