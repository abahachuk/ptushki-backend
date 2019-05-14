import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsOptional, IsString } from 'class-validator';
import { IsNumberStringWithHyphen } from '../../validation/custom-decorators';
import { equalLength } from '../../validation/validation-messages';
import { Dictionary } from './common-interfaces';
import { Ring } from '../ring-entity';
import { Observation } from '../observation-entity';

// Related table in access 'Pullus age'
@Entity()
export class PullusAge implements Dictionary {
  @IsNumberStringWithHyphen()
  @Length(2, 2, { message: equalLength(2) })
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

  @OneToMany(() => Ring, m => m.pullusAge)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.pullusAge)
  public observation: Observation[];
}
