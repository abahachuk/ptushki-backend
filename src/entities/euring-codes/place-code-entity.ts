import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsAlphanumeric, IsOptional, IsString } from 'class-validator';
import { equalLength } from '../../validation/validation-messages';
import { Ring } from '../ring-entity';

// Related table in access 'Place_code_n'
@Entity()
export class PlaceCode {
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

  @OneToMany(() => Ring, m => m.placeCode)
  public ring: Ring[];
}
