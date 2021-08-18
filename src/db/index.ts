import { getConnectionManager, ConnectionManager, Connection } from 'typeorm';
import config from './prepare-db-config';

let connectionManager: ConnectionManager;
let connection: Connection;

export default (): Promise<Connection> => {
  if (!connectionManager) connectionManager = getConnectionManager();
  if (!connection) connection = connectionManager.create(config);

  return connection.connect();
};
