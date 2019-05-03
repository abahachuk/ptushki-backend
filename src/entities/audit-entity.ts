import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user-entity';
import { AuditEventsAction } from './audit-action-events-entity';

@Entity()
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public timestamp: string;

  @ManyToOne(() => AuditEventsAction, m => m.name)
  public action: AuditEventsAction | null;

  @ManyToOne(() => User, m => m.id)
  public user: User | null;

  @Column('varchar', { nullable: true, default: null })
  public information: string | null;
}
