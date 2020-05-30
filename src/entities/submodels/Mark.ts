import { IsString } from 'class-validator';
import { IsCodeExist } from '../../validation/custom-decorators';

export default class Mark {
  @IsString()
  public identificationNumber: string;

  @IsString()
  @IsCodeExist('MarkType')
  public type: string;

  @IsString()
  @IsCodeExist('MarkColor')
  public labelColor: string;

  @IsString()
  @IsCodeExist('MarkColor')
  public markColor: string;

  @IsString()
  @IsCodeExist('MarkPlacement')
  public place: string;

  public static create(values: Mark) {
    return Object.assign(new Mark(), values);
  }
}
