import path from 'path';
import fs from 'fs';
import winston, { format } from 'winston';
import morgan from 'morgan';

const logDirectory = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const options = {
  infoFile: {
    level: 'info',
    filename: path.resolve(logDirectory, 'info.log'),
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    maxFiles: 5,
  },
  errorFile: {
    level: 'error',
    filename: path.resolve(logDirectory, 'error.log'),
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    maxFiles: 5,
  },
  infoConsole: {
    level: 'info',
    handleExceptions: true,
  },
};

const displayFormat = format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  format: format.combine(format.timestamp(), displayFormat),
  transports: [new winston.transports.File(options.infoFile), new winston.transports.File(options.errorFile)],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console(options.infoConsole));
}

const setLogger = morgan('short', {
  stream: {
    write: (meta: string) => {
      logger.info(meta);
    },
  },
});

export { logger, setLogger };
