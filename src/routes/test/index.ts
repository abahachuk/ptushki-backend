import { Router } from 'express';

import { TestController } from '../../controllers';

const { showDefaultMessage } = TestController;
const router: Router = Router();

router.get('/', showDefaultMessage);

export default router;