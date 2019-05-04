export default {
  dbConfig: {
    url: process.env.PG_TEST_URL || null,
    host: process.env.PG_TEST_HOST || 'localhost',
    port: Number.parseInt(process.env.PG_TEST_PORT as string, 10) || 5432,
    database: process.env.PG_TEST_DBNAME || 'ptushki-test',
    username: process.env.PG_TEST_USER || 'username',
    password: process.env.PG_TEST_PASSWORD || 'password',
    dropSchema: true,
  },
  userCrypto: {
    secret: 'secret',
    hashingIterations: 10,
    saltSize: 2,
    hashLength: 2,
    hashingMethod: 'sha512',
  },
};
