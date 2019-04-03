import { Router } from 'express';
import { UsersController, AuthController } from './controllers';

const routes: Router = Router();

export default (): Router => {
  routes.use('/auth', new AuthController().init());
  routes.use('/users', new UsersController().init());
  return routes;
};
