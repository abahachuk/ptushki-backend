import { Connection } from 'typeorm';
import { RefreshToken } from '../entities/auth-entity';

export const authProviders = [
  {
    provide: 'TOKEN_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(RefreshToken),
    inject: ['DATABASE_CONNECTION'],
  },
];
