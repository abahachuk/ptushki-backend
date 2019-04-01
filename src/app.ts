import express, { Application } from 'express';
import bodyParser from 'body-parser';
import routes from './routes';

const createApp = async (connectDb: () => Promise<any>): Promise<Application> => {
  await connectDb();
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(routes());
  return app;
};

export default createApp;
