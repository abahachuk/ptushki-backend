import { Router } from 'express';
import {
  UsersController,
  AuthController,
  // ObservationController,
  // RingsByController,
  InitialDataController,
} from './controllers';
// import { auth } from './services/auth-service';

const routes: Router = Router();

export default async (): Promise<Router> => {
  const initialDataController = new InitialDataController();
  // routes.use('/auth', new AuthController().init());
  routes.use('/users', new UsersController().init());
  // routes.use('/observations', auth.required, new ObservationController().init());
  // routes.use('/rings-by', auth.required, new RingsByController().init());
  // routes.use('/initial-data', auth.required, initialDataController.init());
  await initialDataController.heatUp();
  return routes;
};
