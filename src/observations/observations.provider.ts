import { Connection } from 'typeorm';
import { Observation } from '../entities/observation-entity';

export const observationsProviders = [
  {
    provide: 'OBSERVATIONS_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Observation),
    inject: ['DATABASE_CONNECTION'],
  },
];
