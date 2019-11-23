import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsEmail, MinLength, MaxLength, IsString, IsOptional } from 'class-validator';
import { Ring } from './ring-entity';
// import { Observation } from './observation-entity';
// import { BasaRing } from './basa-ring-entity';

@Entity()
export class Person {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @IsEmail()
  @MaxLength(64)
  @Column('varchar', { length: 64, nullable: true, default: null })
  public email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Column('varchar', { length: 64, nullable: true, default: null })
  public name: string;

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
  @MaxLength(64)
  @Column('varchar', { length: 128, nullable: true, default: null })
  public address: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  @Column('varchar', { length: 2, nullable: true, default: null })
  public code: string;

  @OneToMany(() => Ring, m => m.ringerInformation)
  public ring: Ring[];
  //
  // @OneToMany(() => Observation, m => m.finder)
  // public observation: Observation[];
  //
  // @OneToMany(() => BasaRing, m => m.ringer)
  // public basaRing: BasaRing[];
}
