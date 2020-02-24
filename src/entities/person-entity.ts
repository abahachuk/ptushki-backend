import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsEmail, MinLength, MaxLength, IsString, IsOptional, Length } from 'class-validator';
import { equalLength } from '../validation/validation-messages';
import { Ring } from './ring-entity';
import { Observation } from './observation-entity';
// import { BasaRing } from './basa-ring-entity';

export interface PersonDto {
  id: string;
  email?: string;
  name: string;
  phone?: string;
  altPhone?: string;
  address?: string;
  code?: string;
}

@Entity()
export class Person implements PersonDto {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @IsEmail()
  @MaxLength(64)
  @Column('varchar', { length: 64, nullable: true, default: null })
  public email: string;

  @IsString()
  @Column('varchar', { length: 128, nullable: true, default: null })
  public name: string;

  @IsOptional()
  @IsString()
  @Length(2, 2, { message: equalLength(2) })
  @Column('varchar', { length: 2, nullable: true, default: null })
  public code: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Column('varchar', { length: 64, nullable: true, default: null })
  public phone: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Column('varchar', { length: 64, nullable: true, default: null })
  public altPhone: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  @Column('varchar', { length: 128, nullable: true, default: null })
  public address: string;

  @OneToMany(() => Ring, m => m.ringer)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.finder)
  public observation: Observation[];

  // @OneToMany(() => BasaRing, m => m.ringer)
  // public basaRing: BasaRing[];
}
