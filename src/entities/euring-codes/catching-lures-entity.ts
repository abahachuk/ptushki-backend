import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsOptional, IsString } from 'class-validator';
import { IsAlphaWithHyphen } from '../../validation/custom-decorators';
import { equalLength } from '../../validation/validation-messages';
import { EURINGEntityDto } from '../common-interfaces';
import { Ring } from '../ring-entity';
import { Observation } from '../observation-entity';

// Related table in access 'Cathing lures'
@Entity()
export class CatchingLures implements EURINGEntityDto {
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

  @OneToMany(() => Ring, m => m.catchingLures)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.catchingLures)
  public observation: Observation[];
}
