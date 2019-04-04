import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export default (config: PostgresConnectionOptions) => {
  const preparedConfig: Writeable<PostgresConnectionOptions> = Object.assign({}, config);
  if (config.url) {
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
