import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import config from 'config';
import { UserPayload } from '../services/auth-service';

const { accessSecret } = config.get('auth');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: accessSecret,
    });
  }

  public async validate({ userId, userRole }: UserPayload) {
    return { id: userId, role: userRole };
  }
}
