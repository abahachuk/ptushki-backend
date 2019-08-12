import bodyParser from 'body-parser';
import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { setLogger } from './utils/logger';
import errorHandler from './controllers/error-controller';
import { AppModule } from './app.module';
import setupSwagger from './swaggerSetup';

const createApp = async (): Promise<INestApplication> => {
  const app = await NestFactory.create(AppModule);
  app.use(setLogger);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(errorHandler);
  setupSwagger(app);

  return app;
};

export default createApp;
