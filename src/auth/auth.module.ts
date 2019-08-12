import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { APP_FILTER } from '@nestjs/core';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';
import { authProviders } from './auth.providers';
import { TokensService } from './tokens.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthExceptionFilter } from './auth-exception.filter';

@Module({
  imports: [DatabaseModule, UsersModule, PassportModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
    ...authProviders,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    TokensService,
  ],
})
export class AuthModule {}
