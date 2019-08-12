import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserInfo } from '../entities/user-entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly authService: AuthService;

  public constructor(authService: AuthService) {
    super({
      usernameField: 'email',
      session: false,
    });
    this.authService = authService;
  }

  public async validate(username: string, password: string): Promise<UserInfo> {
    try {
      return await this.authService.validateUser(username, password);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
