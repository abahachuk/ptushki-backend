import { Router } from 'express';
import { UsersController, RingsByController, InitialDataController } from './controllers';
import { auth } from './services/auth-service';

const routes: Router = Router();

export default async (): Promise<Router> => {
  const initialDataController = new InitialDataController();
  routes.use('/users', new UsersController().init());
  routes.use('/rings-by', auth.required, new RingsByController().init());
  routes.use('/initial-data', auth.required, initialDataController.init());
  await initialDataController.heatUp();
  return routes;
};
