import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { observationsProviders } from './observations.provider';
import { ObservationsController } from './observations.controller';
import { ObservationsService } from './observations.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ObservationsController],
  providers: [...observationsProviders, ObservationsService],
})
export class ObservationsModule {}
