import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AuditEventsAction {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('varchar', { unique: true, nullable: true, default: null })
  public name: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;
}
