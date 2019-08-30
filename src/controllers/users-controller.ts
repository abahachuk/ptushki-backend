import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { User } from '../entities/user-entity';

export interface RequestWithUser extends Request {
  user: User;
}

export default class UsersController extends AbstractController {
  private router: Router;

  private users: Repository<User>;

  public init(): Router {
    this.router = Router();
    this.users = getRepository(User);
    this.setMainEntity(this.users);

    this.router.get('/', this.find);
    // this.router.param('id', this.checkId);
    this.router.get('/:id', this.findOne);
    this.router.delete('/:id', this.remove);

    return this.router;
  }

  private find = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.users.find();
      res.json(users);
    } catch (e) {
      next(e);
    }
  };

  // eslint-disable-next-line class-methods-use-this
  private findOne = (req: RequestWithUser, res: Response, next: NextFunction): void => {
    const { user }: { user: User } = req;
    try {
      res.json(user);
    } catch (e) {
      next(e);
    }
  };

  private remove = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { user }: { user: User } = req;
    try {
      await this.users.remove(user);
      res.json({ id: req.params.id, removed: true });
    } catch (e) {
      next(e);
    }
  };
}
