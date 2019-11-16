export default {
  PORT: Number.parseInt(process.env.PORT as string, 10) || 3001,
  HOST: 'localhost',
  UUID_LENGTH: 36,
  dbConfig: {
    type: 'postgres',
    url: process.env.PG_URL || null,
    host: process.env.PG_HOST || 'localhost',
    port: Number.parseInt(process.env.PG_PORT as string, 10) || 5432,
    database: process.env.PG_DBNAME || 'ptushki',
    username: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'password',
    entities: ['src/entities/**/*.ts'],
    synchronize: true,
    logging: false,
    // allow to set max pool size to be able to use free 'DB a service' solution in dev
    // property is not documented, but confirmed to work here
    // https://github.com/typeorm/typeorm/issues/3388#issuecomment-452860552
    extra: process.env.PG_MAX_POOL_SIZE ? { max: 4 } : {},
  },
  userCrypto: {
    secret: process.env.USER_CRYPTO_SECRET || 'secret',
    hashingIterations: Number.parseInt(process.env.USER_CRYPTO_N_ITER as string, 10) || 1000,
    saltSize: Number.parseInt(process.env.USER_CRYPTO_SALT_L as string, 10) || 16,
    hashLength: Number.parseInt(process.env.USER_CRYPTO_HASH_L as string, 10) || 32,
    hashingMethod: process.env.USER_CRYPTO_METHOD || 'sha512',
  },
  auth: {
    accessSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'secret',
    refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'secret',
    accessExpires: Number.parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES as string, 10) || '1h',
    refreshExpires: process.env.JWT_REFRESH_TOKEN_EXPIRES || '30d',
  },
  paging: {
    pageNumberDefault: 0,
    pageSizeDefault: 5,
    sortingDirectionDefault: 'ASC',
  },
};
