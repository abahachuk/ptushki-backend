import { Controller, UseGuards, Req, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiUnauthorizedResponse, ApiUseTags } from '@nestjs/swagger';
import { User } from '../entities/user-entity';
import { ObservationsService } from './observations.service';
import { ObservationQuery } from '../services/observation-service';
import { Observation } from '../entities/observation-entity';

interface RequestWithUser extends Request {
  user: User;
}

@UseGuards(AuthGuard('jwt'))
@Controller('observations')
@ApiUseTags('observations')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Need authorisation' })
export class ObservationsController {
  private readonly observationsService: ObservationsService;

  public constructor(observationsService: ObservationsService) {
    this.observationsService = observationsService;
  }

  @Get('/')
  @ApiOkResponse({ description: 'All available observations.', type: [Observation] })
  public async getObservations(@Req() { user }: RequestWithUser, @Query() query: ObservationQuery) {
    return this.observationsService.getAll(user, query);
  }

  @Get('/aggregations')
  @ApiOkResponse({ description: 'All available observations.', type: [Observation] })
  public async getAggregations() {
    return this.observationsService.getAggregations();
  }
}
