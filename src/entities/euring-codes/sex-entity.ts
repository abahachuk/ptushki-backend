import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Length, IsAlpha, IsOptional, IsString } from 'class-validator';
import { equalLength } from '../../validation/validation-messages';
import { EntityDto } from '../common-interfaces';
import { Ring } from '../ring-entity';
import { BasaRing } from '../basa-ring-entity';
import { Observation } from '../observation-entity';

// Related tables in access 'Sex' and 'Sex by schem'
@Entity()
export class Sex implements EntityDto {
  @IsAlpha()
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

  @OneToMany(() => Ring, m => m.sexMentioned)
  public mentionedInRing: Ring[];

  @OneToMany(() => Ring, m => m.sexConcluded)
  public concludedInRing: Ring[];

  @OneToMany(() => Observation, m => m.sexMentioned)
  public mentionedInObservation: Observation[];

  @OneToMany(() => Observation, m => m.sexConcluded)
  public concludedInObservation: Observation[];

  @OneToMany(() => BasaRing, m => m.species)
  public basaRing: BasaRing[];
}
