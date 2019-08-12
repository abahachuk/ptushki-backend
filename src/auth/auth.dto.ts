import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { UserInfo } from '../entities/user-entity';
import { TokensPairDto } from './tokens.service';

export class RefreshReqDto {
  @ApiModelProperty()
  public refreshToken: string;
}

export class LogoutReqDto extends RefreshReqDto {
  @ApiModelPropertyOptional({ default: false })
  public closeAllSessions?: boolean;
}

export class SuccessAuthDto extends TokensPairDto {
  @ApiModelProperty()
  public readonly user: UserInfo;
}
