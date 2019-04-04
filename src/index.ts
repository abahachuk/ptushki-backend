// @ts-ignore
import 'dotenv/config';
import config from 'config';
import { Application } from 'express';

import createApp from './app';
import connectDB from './db';
import { logger } from './configs/logger';
import { initProssesErrorHandler } from './exceptions/process-error-handler';

initProssesErrorHandler(logger);

const PORT = config.get('PORT');

createApp(connectDB)
  .then((app: Application) => {
    app.listen(PORT, () => {
      logger.info(`App is listened at ${PORT}`);
    });
  })
  .catch(logger.error);
