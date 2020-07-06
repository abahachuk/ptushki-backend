import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export default class UserPlace {
  @IsString()
  public customName: string;

  @IsOptional()
  @IsString()
  public geoName?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  public latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  public longitude: number;

  public static create(values: UserPlace) {
    return Object.assign(new UserPlace(), values);
  }
}
