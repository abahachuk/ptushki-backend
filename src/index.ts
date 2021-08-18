import 'dotenv/config';
import config from 'config';
import { Connection } from 'typeorm';

import createApp from './app';
import connectDB from './db';
import { logger } from './utils/logger';

const PORT = config.get('PORT');

(async () => {
  logger.info(`Starting the App`);
  let connection: Connection | undefined;

  try {
    connection = await connectDB();
    logger.info(`App was connected to DB`);

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

process.on('uncaughtException', (error: Error) => {
  logger.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (error: Error) => {
  logger.error(error);
  process.exit(1);
});

process.on('warning', (warning: Error) => {
  logger.warn(`Warning detected: ${warning}`);
});

process.on('exit', (code: number) => {
  logger.info(`Stopped with code: ${code}`);
});
