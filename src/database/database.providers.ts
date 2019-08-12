import { createConnection } from 'typeorm';
import config from '../db/prepare-db-config';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async () => createConnection(config),
  },
];
