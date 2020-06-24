import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsAlphanumeric, IsOptional, IsString } from 'class-validator';
import { equalLength } from '../../validation/validation-messages';
import { EURINGEntityDto } from '../common-interfaces';
import { Ring } from '../ring-entity';
import { Observation } from '../observation-entity';

// Related table in access 'Primary identification mehod'
@Entity()
export class PrimaryIdentificationMethod implements EURINGEntityDto {
  @IsAlphanumeric()
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

  @OneToMany(() => Ring, m => m.primaryIdentificationMethod)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.primaryIdentificationMethod)
  public observation: Observation[];
}
