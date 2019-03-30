import { logger } from './configs/logger';
import app from './app';

app.listen(app.get('port'), () => {
  logger.info(`App is listened at ${app.get('port')}`);
});
