// @ts-ignore
import 'dotenv/config';
import config from 'config';
import { Application } from 'express';

import createApp from './app';
import connectDB from './db';

const PORT = config.get('PORT');

createApp(connectDB)
  .then((app: Application) => {
    app.listen(PORT, () => {
      console.log(`App is listened at ${PORT}`);
    });
  })
  .catch(console.error);
