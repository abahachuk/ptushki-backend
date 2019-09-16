import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsNumberString, IsOptional, IsString } from 'class-validator';
import { equalLength } from '../../validation/validation-messages';
import { EntityDto } from '../common-interfaces';
import { Ring } from '../ring-entity';
import { BasaRing } from '../basa-ring-entity';
import { Observation } from '../observation-entity';

export interface SpeciesDto extends EntityDto {
  letterCode: string | null;
  species: string;
  ordo: string | null;
  family: string | null;
}

// Related tables in access 'Species' and 'Species by Schem'
@Entity()
export class Species implements SpeciesDto {
  @IsNumberString()
  @Length(5, 5, { message: equalLength(5) })
  @PrimaryColumn()
  public id: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public letterCode: string | null;

  @IsString()
  @Column()
  public species: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public ordo: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public family: string | null;

  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string;

  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string;

  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string;

  @OneToMany(() => Ring, m => m.speciesMentioned)
  public mentionedInRing: Ring[];

  @OneToMany(() => Ring, m => m.speciesConcluded)
  public concludedInRing: Ring[];

  @OneToMany(() => Observation, m => m.speciesMentioned)
  public mentionedInObservation: Observation[];

  @OneToMany(() => Observation, m => m.speciesConcluded)
  public concludedInObservation: Observation[];

  @OneToMany(() => BasaRing, m => m.species)
  public basaRing: BasaRing[];
}
