import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ApiModelProperty } from '@nestjs/swagger';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import config from 'config';
import { promisify } from 'util';
import { RefreshToken } from '../entities/auth-entity';
import { UserPayload } from '../services/auth-service';
import { AuthException, AuthExceptionStatus } from './auth.exception';

export class TokensPairDto {
  @ApiModelProperty()
  public token: string;

  @ApiModelProperty()
  public refreshToken: string;
}

const { accessSecret, refreshSecret, accessExpires, refreshExpires } = config.get('auth');
const verify = promisify(jwt.verify);

@Injectable()
export class TokensService {
  private readonly tokens: Repository<RefreshToken>;

  public constructor(
    @Inject('TOKEN_REPOSITORY')
    tokens: Repository<RefreshToken>,
  ) {
    this.tokens = tokens;
  }

  private signTokens(
    payload: UserPayload,
    {
      accessExpiresIn = accessExpires,
      refreshExpiresIn = refreshExpires,
    }: { accessExpiresIn?: number | string; refreshExpiresIn?: number | string } = {},
  ): TokensPairDto {
    const token = `Bearer ${jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn })}`;
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiresIn });
    return { token, refreshToken };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<UserPayload> {
    const { userId, userRole } = (await verify(refreshToken, refreshSecret)) as UserPayload;
    return { userId, userRole };
  }

  public async getTokens(userPayload: UserPayload) {
    const tokens = this.signTokens(userPayload);
    await this.tokens.save(new RefreshToken(tokens.refreshToken, userPayload.userId));
    return tokens;
  }

  public async deactivateToken(refreshToken: string, closeAllSessions: boolean = false) {
    if (!refreshToken) {
      throw new AuthException('Refresh token is required', AuthExceptionStatus.TOKEN_REQUIRED);
    }

    try {
      const { userId, userRole } = await this.verifyRefreshToken(refreshToken);
      const token = await this.tokens.findOne({ token: refreshToken });
      if (token) {
        throw new AuthException('Token already was used or never existed', AuthExceptionStatus.TOKEN_NOT_FOUND);
      }
      await this.tokens.delete(closeAllSessions ? { userId } : { token: refreshToken });
      return { userId, userRole };
    } catch (e) {
      // README goes first as it is subclass of JsonWebTokenError
      if (e instanceof TokenExpiredError) {
        throw new AuthException('Token expired', AuthExceptionStatus.TOKEN_EXPIRED);
      }
      if (e instanceof JsonWebTokenError) {
        throw new AuthException('Token invalid', AuthExceptionStatus.TOKEN_INVALID);
      }

      throw e;
    }
  }
}
