// @ts-ignore
import 'dotenv/config';
import config from 'config';

import createApp from './app';
import { logger } from './utils/logger';

const PORT = config.get('PORT') as number;

(async () => {
  try {
    const app = await createApp();
    app.listen(PORT, () => {
      logger.info(`App is listened at ${PORT}`);
    });
  } catch (e) {
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
