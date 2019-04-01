export default {
  PORT: Number.parseInt(process.env.PORT, 10) || 3001,
  dbConfig: {
    type: 'postgres',
    url: process.env.PG_URL || null,
    host: process.env.PG_HOST || 'localhost',
    port: Number.parseInt(process.env.PG_PORT, 10) || 5432,
    database: process.env.PG_DBNAME || 'ptushki',
    username: process.env.PG_USER || 'username',
    password: process.env.PG_PASSWORD || 'password',
    entities: ['src/entities/**/*.ts'],
    synchronize: false,
    logging: false,
  },
};
