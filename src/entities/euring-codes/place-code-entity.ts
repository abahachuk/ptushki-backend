import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsAlphanumeric, IsOptional, IsString } from 'class-validator';
import { equalLength } from '../../validation/validation-messages';
import { Ring } from '../ring-entity';
import { EntityDto } from '../common-interfaces';

export interface PlaceCodeDto extends EntityDto {
  country?: string | null;
  region?: string | null;
}

// Related table in access 'Place_code_n'
@Entity()
export class PlaceCode implements PlaceCodeDto {
  @IsAlphanumeric()
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
  public region: string | null;

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

  @OneToMany(() => Ring, m => m.placeCode)
  public ring: Ring[];
}
