import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { Server } from 'typescript-rest';

import routes from './routes';
import { setLogger } from './utils/logger';
import errorHandler from './controllers/error-controller';
import { initPassport } from './services/auth-service';

const createApp = async (): Promise<Application> => {
  const app = express();

  initPassport();
  app.use(setLogger);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(await routes());

  Server.loadServices(app, 'controllers/*-controller.ts', __dirname);
  Server.swagger(app, { filePath: './dist/swagger.json', endpoint: 'swagger' });

  app.use(errorHandler);

  return app;
};

export default createApp;
