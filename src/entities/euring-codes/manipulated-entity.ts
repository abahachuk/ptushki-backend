import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsAlpha, IsOptional, IsString } from 'class-validator';
import { equalLength } from '../../validation/validation-messages';
import { Dictionary } from '../common-interfaces';
import { Ring } from '../ring-entity';
import { Observation } from '../observation-entity';

// Related table in access 'Manipulated'
@Entity()
export class Manipulated implements Dictionary {
  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @PrimaryColumn()
  public id: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string | null;

  @OneToMany(() => Ring, m => m.manipulated)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.manipulated)
  public observation: Observation[];
}
