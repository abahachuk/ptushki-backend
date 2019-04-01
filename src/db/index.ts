import config from 'config';
import { getConnectionManager, ConnectionManager, Connection } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import prepareDbConfig from './prepare-db-config';

const dbConfig: PostgresConnectionOptions = config.get('dbConfig');
const connectionManager: ConnectionManager = getConnectionManager();
const connection: Connection = connectionManager.create(prepareDbConfig(dbConfig));

export default () => connection.connect();
