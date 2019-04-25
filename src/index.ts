// @ts-ignore
import 'dotenv/config';
import config from 'config';
import { Connection } from 'typeorm';

import createApp from './app';
import connectDB from './db';
import { logger } from './configs/logger';

process.on('uncaughtException', (error: Error) => {
  logger.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (error: Error) => {
  logger.error(error);
  process.exit(1);
});

const PORT = config.get('PORT');

(async () => {
  let connection: Connection | undefined;
  try {
    connection = await connectDB();
    const app = await createApp();
    app.listen(PORT, () => {
      logger.info(`App is listened at ${PORT}`);
    });
  } catch (e) {
    if (connection) {
      await connection.close();
    }
    logger.error(e);
    process.exit(1);
  }
})();
