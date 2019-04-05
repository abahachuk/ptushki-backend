import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RefNo {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public zapros: boolean;

  @Column()
  public otvet: boolean;

  @Column()
  public informaciya: boolean;

  @Column('varchar', { nullable: true, default: null })
  public svedenija_informatoru: string | null;

  @Column('varchar', { nullable: true, default: null })
  public zapros_file: string | null;

  @Column('varchar', { nullable: true, default: null })
  public otvet_file: string | null;

  @Column('varchar', { nullable: true, default: null })
  public informaciya_file: string | null;

  @Column('varchar', { nullable: true, default: null })
  public other_file: string | null;

  @Column('varchar', { nullable: true, default: null })
  public note: string | null;
}
