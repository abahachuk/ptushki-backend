import { Router } from 'express';
import { UsersController, AuthController, ObservationController } from './controllers';

const routes: Router = Router();

export default (): Router => {
  routes.use('/auth', new AuthController().init());
  routes.use('/users', new UsersController().init());
  routes.use('/observations', new ObservationController().init());
  return routes;
};
