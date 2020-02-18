import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { IsUUID, Length, IsString, IsOptional, IsAlpha, IsAlphanumeric, IsNumberString } from 'class-validator';
import { equalLength } from '../validation/validation-messages';
import { Species } from './euring-codes/species-entity';
import { Sex } from './euring-codes/sex-entity';
import { Age } from './euring-codes/age-entity';
import { User } from './user-entity';

@Entity()
export class BasaRing {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @IsAlphanumeric()
  @Column('varchar')
  public ringNumber: string;

  @IsOptional()
  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Sex, m => m.basaRing, {
    eager: true,
  })
  public sex: Sex;

  @IsOptional()
  @IsAlphanumeric()
  @Length(1, 1, { message: equalLength(1) })
  @ManyToOne(() => Age, m => m.basaRing, {
    eager: true,
  })
  public age: Age;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public region: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public district: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public place: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public coordinates: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public note: string | null;

  @IsOptional()
  @IsNumberString()
  @Length(5, 5, { message: equalLength(5) })
  @ManyToOne(() => Species, m => m.basaRing, {
    eager: true,
  })
  public species: Species;

  @IsOptional()
  @IsUUID()
  @ManyToOne(() => User, m => m.basaRing, {
    eager: true,
  })
  public ringer: User;
}
