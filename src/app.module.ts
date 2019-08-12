import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { DatabaseExceptionFilter } from './database/database-exception.filter';
import { ObservationsModule } from './observations/observations.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, ObservationsModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
  ],
})
export class AppModule {}
