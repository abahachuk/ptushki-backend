import { Router } from 'express';
import { UsersController } from './controllers';

const routes: Router = Router();

export default (): Router => {
  routes.use('/users', new UsersController().init());
  return routes;
};
