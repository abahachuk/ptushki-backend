import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import routes from './routes';
import { setLogger, combinedLogger } from './configs/logger';

dotenv.config();

const app = express();

app.use(setLogger);
app.set('port', process.env.PORT || 3001);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);
app.use(combinedLogger);

export default app;
