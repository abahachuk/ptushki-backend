import { Length, IsDateString, IsString, IsOptional, IsAlpha, IsAlphanumeric, IsNumberString } from 'class-validator';
import { IsAlphaWithHyphen } from '../../validation/custom-decorators';
import { equalLength } from '../../validation/validation-messages';

export class ImportValidator {
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

  @IsOptional()
  @IsString()
  public eu_placeCode: string | null;

  @IsDateString()
  public date: Date | null;

  @Length(7, 7, { message: equalLength(7) })
  public latitude: string | null;

  @Length(7, 7, { message: equalLength(7) })
  public longitude: string | null;

  @IsAlphaWithHyphen()
  @Length(1, 1, { message: equalLength(1) })
  public eu_statusCode: string;

  @IsOptional()
  @IsString()
  public remarks: string | null;

  public static async create(data: ImportValidator): Promise<ImportValidator> {
    return Object.assign(new ImportValidator(), data);
  }
}
