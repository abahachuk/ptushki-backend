import { Logger } from 'winston';

const initProssesErrorHandler = (logger: Logger) => {
  process.on('uncaughtException', (error: Error) => {
    logger.error(error);
    process.exit(1);
  });

  process.on('unhandledRejection', (error: Error) => {
    logger.error(error);
    process.exit(1);
  });
};

export { initProssesErrorHandler };
