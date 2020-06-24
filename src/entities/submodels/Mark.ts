import { IsString, IsOptional } from 'class-validator';
import { IsCodeExist } from '../../validation/custom-decorators';

export default class Mark {
  @IsOptional()
  @IsString()
  public identificationNumber?: string;

  @IsString()
  @IsCodeExist('MarkType')
  public type: string;

  @IsOptional()
  @IsString()
  @IsCodeExist('MarkColor')
  public labelColor?: string;

  @IsOptional()
  @IsString()
  @IsCodeExist('MarkColor')
  public markColor?: string;

  @IsOptional()
  @IsString()
  @IsCodeExist('MarkPlacement')
  public place?: string;

  public static create(values: Mark) {
    return Object.assign(new Mark(), values);
  }
}
