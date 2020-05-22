import { IsString, IsEnum } from 'class-validator';

export enum MarkType {
  plasticRing = 'PR',
  transponder = 'Tr',
}

export enum MarkColor {
  white = 'We',
  black = 'Bk',
  yellow = 'Yw',
  red = 'Rd',
  blue = 'Be',
  green = 'Gn',
}

export enum MarkPlacement {
  leftLeg = 'LL',
  righLeg = 'RL',
}

export default class Mark {
  @IsString()
  public identificationNumber: string;

  @IsEnum(MarkType)
  public type: MarkType;

  @IsEnum(MarkColor)
  public labelColor: MarkColor;

  @IsEnum(MarkColor)
  public markColor: MarkColor;

  @IsEnum(MarkPlacement)
  public place: MarkPlacement;

  public static create(values: Mark) {
    return Object.assign(new Mark(), values);
  }
}
