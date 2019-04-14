import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Species } from './species-entity';
import { Sex } from './sex-entity';
import { Age } from './age-entity';
import { User } from './user-entity';

@Entity()
export class BasaRing {
  @PrimaryColumn()
  public id: string;

  @ManyToOne(() => Species, m => m.basaRing)
  public species: Species;

  @ManyToOne(() => Sex, m => m.basaRing)
  public sex: Sex;

  @ManyToOne(() => Age, m => m.basaRing)
  public age: Age;

  @ManyToOne(() => User, m => m.basaRing)
  public ringer: User;

  @Column('varchar', { nullable: true, default: null })
  public region: string | null;

  @Column('varchar', { nullable: true, default: null })
  public district: string | null;

  @Column('varchar', { nullable: true, default: null })
  public place: string | null;

  @Column('varchar', { nullable: true, default: null })
  public coordinates: string | null;

  @Column('varchar', { nullable: true, default: null })
  public note: string | null;
}
