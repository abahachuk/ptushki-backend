import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsAlpha, IsOptional, IsString } from 'class-validator';
import { equalLength } from '../../validation/validation-messages';
import { Ring } from '../ring-entity';

// Related table in access 'Ringing schem'
@Entity()
export class RingingScheme {
  @IsAlpha()
  @Length(3, 3, { message: equalLength(3) })
  @PrimaryColumn()
  public id: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public status: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public country: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public center: string | null;

  @OneToMany(() => Ring, m => m.ringingScheme)
  public ring: Ring[];
}
