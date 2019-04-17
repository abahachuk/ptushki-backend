import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Dictionary } from './common-interfaces';

@Entity()
export class AuditEventsAction implements Dictionary {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('varchar', { unique: true, nullable: true, default: null })
  public name: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;
}
