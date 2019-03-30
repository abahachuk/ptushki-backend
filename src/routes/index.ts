import { Router } from 'express';
import { checkSchema } from 'express-validator/check';
import { checkValidationStatus } from '../validation';

import test from './test';
import schemas from '../validation/shemas';

const routes: Router = Router();

// @ts-ignore
routes.use('/', checkSchema(schemas.test), checkValidationStatus, test);

export default routes;
