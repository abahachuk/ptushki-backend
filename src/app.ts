import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import routes from './routes';

dotenv.config();

const app = express();
app.set('port', process.env.PORT || 3001);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);

export default app;