// @ts-ignore
import 'dotenv/config';
import config from 'config';
import { Application } from 'express';

import app from './app';
import connectDB from './db';
import routes from './routes';

const PORT = config.get('PORT');

const createApp = async (): Promise<Application> => {
  await connectDB();
  app.use(routes());
  return app;
};

if (!module.parent) {
  (async () => {
    try {
      (await createApp()).listen(PORT, () => {
        console.log(`App is listened at ${PORT}`);
      });
    } catch (e) {
      console.error(e);
    }
  })();
}

export default createApp;
