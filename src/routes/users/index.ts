import { Router } from 'express';

import { UsersController } from '../../controllers';

const router: Router = Router();
const controller = new UsersController();

router.get('/', controller.find);
router.post('/', controller.create);
router.param('id', controller.checkId);
router.get('/:id', controller.findOne);
router.delete('/:id', controller.remove);

export default router;
