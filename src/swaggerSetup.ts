import { Application } from 'express';
// @ts-ignore
import swaggerUi from 'swagger-ui-express';

import * as swaggerDocument from '../swagger.json';

const setupSwagger = (app: Application, { host }: { host: string }): void => {
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup({ host, ...swaggerDocument }));
};

export default setupSwagger;
