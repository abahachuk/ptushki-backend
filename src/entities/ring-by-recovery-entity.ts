import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { RingData } from './ring-data-entity';
import { User } from './user-entity';
import { RefNo } from './ref-no-entity';

@Entity()
export class RingByRecovery {
  @PrimaryGeneratedColumn('uuid') public id: string;

  @OneToOne(() => RingData)
  @JoinColumn()
  public ringData: RingData;

  @ManyToOne(() => User, finder => finder.ringByRecovery)
  public finder: User;

  @OneToOne(() => RefNo)
  @JoinColumn()
  public refNo: User;
}
