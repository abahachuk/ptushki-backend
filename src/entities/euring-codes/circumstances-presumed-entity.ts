import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { EURINGEntityDto } from '../common-interfaces';
import { Ring } from '../ring-entity';
import { Observation } from '../observation-entity';

// Related table in access 'Circumstances presumed'
@Entity()
export class CircumstancesPresumed implements EURINGEntityDto {
  @IsInt()
  @Min(0)
  @Max(1)
  @PrimaryColumn()
  public id: number;

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

  @OneToMany(() => Ring, m => m.circumstancesPresumed)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.circumstancesPresumed)
  public observation: Observation[];
}
