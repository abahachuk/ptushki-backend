import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { EntityDto } from '../common-interfaces';
import { Ring } from '../ring-entity';

// Related table in access 'Verification of the metal ring'
@Entity()
export class VerificationOfTheMetalRing implements EntityDto {
  @IsInt()
  @Min(0)
  @Max(9)
  @PrimaryColumn()
  public id: number;

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

  @OneToMany(() => Ring, m => m.verificationOfTheMetalRing)
  public ring: Ring[];
}
