import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsOptional, IsString } from 'class-validator';
import { equalLength } from '../../validation/validation-messages';
import { Ring } from '../ring-entity';
import { EURINGEntityDto } from '../common-interfaces';
import { IsAlphanumericWithHyphen } from '../../validation/custom-decorators';

export interface PlaceCodeDto extends EURINGEntityDto {
  country?: string | null;
  region?: string | null;
}

// Related table in access 'Place_code_n'
@Entity()
export class PlaceCode implements PlaceCodeDto {
  @IsAlphanumericWithHyphen()
  @Length(4, 4, { message: equalLength(4) })
  @PrimaryColumn()
  public id: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public country: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public region: string;

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

  @OneToMany(() => Ring, m => m.placeCode)
  public ring: Ring[];
}
