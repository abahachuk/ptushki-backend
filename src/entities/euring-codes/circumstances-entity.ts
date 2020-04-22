import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsNumberString, IsOptional, IsString } from 'class-validator';
import { equalLength } from '../../validation/validation-messages';
import { EURINGEntityDto } from '../common-interfaces';
import { Ring } from '../ring-entity';
import { Observation } from '../observation-entity';

// Related table in access 'Circumstances'
@Entity()
export class Circumstances implements EURINGEntityDto {
  @IsNumberString()
  @Length(2, 2, { message: equalLength(2) })
  @PrimaryColumn()
  public id: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string;

  @OneToMany(() => Ring, m => m.circumstances)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.circumstances)
  public observation: Observation[];
}
