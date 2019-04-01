import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { User } from '../entities/user-entity';

interface RequestWithUser extends Request {
  user: User;
}

export default class UsersControler extends AbstractController {
  protected router: Router;

  private users: Repository<User>;

  public init(): Router {
    this.router = Router();
    this.users = getRepository(User);

    this.router.get('/', this.find);
    this.router.post('/', this.create);
    this.router.param('id', this.checkId);
    this.router.get('/:id', this.findOne);
    this.router.delete('/:id', this.remove);

    return this.router;
  }

  private checkId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id }: { id: string } = req.params;
    try {
      if (id.length !== 24) {
        throw new Error(`Provided user identificator (${id}) is incorrect`);
      }
      const user = await this.users.findOne(id);
      if (!user) {
        throw new Error(`User with ${id} not exists`);
      }
      Object.assign(req, { user });
      next();
    } catch (e) {
      next(e);
    }
  };

  private find = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  private create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.create(req.body);
      await this.users.save(user);
      res.json(user);
    } catch (e) {
      next(e);
    }
  };

  private remove = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { user }: { user: User } = req;
    try {
      await this.users.remove(user);
      res.json({ id: user.id, removed: true });
    } catch (e) {
      next(e);
    }
  };
}
