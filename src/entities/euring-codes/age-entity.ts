import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsAlphanumeric, IsOptional, IsString } from 'class-validator';
import { equalLength } from '../../validation/validation-messages';
import { EURINGEntityDto } from '../common-interfaces';
import { Ring } from '../ring-entity';
import { BasaRing } from '../basa-ring-entity';
import { Observation } from '../observation-entity';

// Related tables in access are 'Age' and 'Age by Schem' (they are similar)
@Entity()
export class Age implements EURINGEntityDto {
  @IsAlphanumeric()
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

  @OneToMany(() => Ring, m => m.ageMentioned)
  public mentionedInRing: Ring[];

  @OneToMany(() => Ring, m => m.ageConcluded)
  public concludedInRing: Ring[];

  @OneToMany(() => Observation, m => m.ageMentioned)
  public mentionedInObservation: Observation[];

  @OneToMany(() => Observation, m => m.ageConcluded)
  public concludedInObservation: Observation[];

  @OneToMany(() => BasaRing, m => m.age)
  public basaRing: BasaRing[];
}
