import { Router } from 'express';
import test from './test';

const routes: Router = Router();

routes.use('/', test);

export default routes;
