import { getConnectionManager, ConnectionManager, Connection } from 'typeorm';
import config from './prepare-db-config';

const connectionManager: ConnectionManager = getConnectionManager();
const connection: Connection = connectionManager.create(config);

export default (): Promise<Connection> => connection.connect();
