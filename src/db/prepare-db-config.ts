import config from 'config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

const dbConfigRaw: PostgresConnectionOptions = config.get('dbConfig');

const prepareConfig = (dbConfig: PostgresConnectionOptions) => {
  const preparedConfig: Writeable<PostgresConnectionOptions> = Object.assign({}, dbConfig);
  if (dbConfig.url) {
    // all specified bellow properties take precedence over `url`
    delete preparedConfig.username;
    delete preparedConfig.password;
    delete preparedConfig.database;
    delete preparedConfig.port;
    delete preparedConfig.host;
    return preparedConfig;
  }
  return preparedConfig;
};

export default prepareConfig(dbConfigRaw);
