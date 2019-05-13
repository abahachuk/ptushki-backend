import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsAlpha, IsOptional, IsString } from 'class-validator';
import { equalLength } from '../../validation/validation-messages';
import { Ring } from '../ring-entity';

// Related table in access 'Status of ring'
@Entity()
export class StatusOfRing {
  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @PrimaryColumn()
  public id: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public description: string | null;

  @OneToMany(() => Ring, m => m.statusOfRing)
  public ring: Ring[];
}
