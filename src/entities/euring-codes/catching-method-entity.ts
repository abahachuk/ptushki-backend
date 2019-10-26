import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsOptional, IsString } from 'class-validator';
import { IsAlphaWithHyphen } from '../../validation/custom-decorators';
import { equalLength } from '../../validation/validation-messages';
import { EntityDto } from '../common-interfaces';
import { Ring } from '../ring-entity';
import { Observation } from '../observation-entity';

// Related table in access 'Catching method'
@Entity()
export class CatchingMethod implements EntityDto {
  @IsAlphaWithHyphen()
  @Length(1, 1, { message: equalLength(1) })
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

  @OneToMany(() => Ring, m => m.catchingMethod)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.catchingMethod)
  public observation: Observation[];
}
