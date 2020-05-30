import { Entity, PrimaryColumn, Column } from 'typeorm';
import { IsOptional, IsString, IsUppercase } from 'class-validator';
import { IsAlphaWithHyphen } from '../../validation/custom-decorators';

// Custom Code unrelated with EURING for ringing centre purposes
// used by other marks custom scheme

@Entity()
export class MarkType {
  @IsAlphaWithHyphen()
  @IsUppercase()
  @PrimaryColumn()
  public id: string;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_eng: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_rus: string | null;

  @IsOptional()
  @IsString()
  @Column('varchar', { nullable: true, default: null })
  public desc_byn: string | null;
}
