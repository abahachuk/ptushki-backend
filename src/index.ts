// @ts-ignore
import 'dotenv/config';
import config from 'config';
import { Application } from 'express';

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

createApp(connectDB)
  .then((app: Application) => {
    app.listen(PORT, () => {
      logger.info(`App is listened at ${PORT}`);
    });
  })
  .catch(logger.error);
