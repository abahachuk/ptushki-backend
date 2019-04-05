export default {
  PORT: Number.parseInt(process.env.PORT as string, 10) || 3001,
  UUID_LENGTH: 36,
  dbConfig: {
    type: 'postgres',
    url: process.env.PG_URL || null,
    host: process.env.PG_HOST || 'localhost',
    port: Number.parseInt(process.env.PG_PORT as string, 10) || 5432,
    database: process.env.PG_DBNAME || 'ptushki',
    username: process.env.PG_USER || 'username',
    password: process.env.PG_PASSWORD || 'password',
    entities: ['src/entities/**/*.ts'],
    synchronize: true,
    logging: false,
  },
  userCrypto: {
    secret: process.env.USER_CRYPTO_SECRET || 'secret',
    hashingIterations: Number.parseInt(process.env.USER_CRYPTO_N_ITER as string, 10) || 1000,
    saltSize: Number.parseInt(process.env.USER_CRYPTO_SALT_L as string, 10) || 16,
    hashLength: Number.parseInt(process.env.USER_CRYPTO_HASH_L as string, 10) || 32,
    hashingMethod: process.env.USER_CRYPTO_METHOD || 'sha512',
  },
};
