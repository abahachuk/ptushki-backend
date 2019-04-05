import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Connection } from 'typeorm';
import routes from './routes';
import { setLogger } from './configs/logger';
import errorHandler from './controllers/error-controller';
import { initPassport } from './configs/passport';

const createApp = async (connectDb: () => Promise<Connection>): Promise<Application> => {
  await connectDb();
  const app = express();
  initPassport();
  app.use(setLogger);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(routes());
  app.use(errorHandler);
  return app;
};

export default createApp;
