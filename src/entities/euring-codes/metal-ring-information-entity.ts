import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { Dictionary } from '../common-interfaces';
import { Ring } from '../ring-entity';

// Related table in access 'Metal ring information'
@Entity()
export class MetalRingInformation implements Dictionary {
  @IsInt()
  @Min(0)
  @Max(7)
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

  @OneToMany(() => Ring, m => m.metalRingInformation)
  public ring: Ring[];
}
