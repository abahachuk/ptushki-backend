import {
  Length,
  IsDateString,
  IsString,
  IsOptional,
  IsAlpha,
  IsAlphanumeric,
  IsNumberString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Column } from 'typeorm';
import { IsAlphaWithHyphen } from '../../../validation/custom-decorators';
import { equalLength } from '../../../validation/validation-messages';
import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';

export class ImportObservationsValidator {
  @IsString()
  public ringNumber: string;

  @IsOptional()
  @IsString()
  public colorRing: string | null;

  @IsNumberString()
  @Length(5, 5, { message: equalLength(5) })
  public eu_species: string;

  @IsAlpha()
  @Length(1, 1, { message: equalLength(1) })
  public eu_sexCode: string;

  @IsAlphanumeric()
  @Length(1, 1, { message: equalLength(1) })
  public eu_ageCode: string;

  @IsString()
  public eu_placeCode: string | null;

  @IsDateString()
  public date: Date | null;

  // Related fields in access 'Lat deg', 'Lat min', 'Lat sec'
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Column('decimal', {
    precision: 10,
    scale: 8,
    nullable: true,
    default: null,
    transformer: new ColumnNumericTransformer(),
  })
  public latitude: number;

  // Related fields in access 'Lon deg', 'Lon min', 'Lon sec'
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Column('decimal', {
    precision: 11,
    scale: 8,
    nullable: true,
    default: null,
    transformer: new ColumnNumericTransformer(),
  })
  public longitude: number;

  @IsAlphaWithHyphen()
  @Length(1, 1, { message: equalLength(1) })
  public eu_statusCode: string;

  @IsOptional()
  @IsString()
  public remarks: string | null;

  public static async create(data: ImportObservationsValidator): Promise<ImportObservationsValidator> {
    return Object.assign(new ImportObservationsValidator(), data);
  }
}
