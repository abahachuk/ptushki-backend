import { Router } from 'express';
import { UsersController, AuthController, ObservationController, RingsByController } from './controllers';
// import { auth } from './services/auth-service';

const routes: Router = Router();

export default (): Router => {
  routes.use('/auth', new AuthController().init());
  routes.use('/users', new UsersController().init());
  routes.use('/observations', new ObservationController().init());
  routes.use('/rings-by', new RingsByController().init());
  return routes;
};
