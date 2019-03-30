import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import winston from 'winston';
import morgan from 'morgan';

import HttpException from '../exceptions/httpException';

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
    format: winston.format.simple(),
  },
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.infoFile),
    new winston.transports.File(options.errorFile),
    new winston.transports.Console(options.infoConsole),
  ],
});

const combinedFormat = (err: HttpException, req: Request): string => {
  return `${req.ip} - - 
          ${req.method} 
          ${req.originalUrl} HTTP/${req.httpVersion} 
          ${err.status || 500} - 
          ${req.headers['user-agent']}`;
};

const setLogger = morgan('short', {
  stream: {
    write: (meta: string) => {
      logger.info(meta);
    },
  },
});

const combinedLogger = (err: HttpException, req: Request, res: Response): void => {
  logger.error(combinedFormat(err, req));
  res.status(err.status || 500).send(err);
};

export { logger, setLogger, combinedLogger };
