import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { User } from '../entities/user-entity';

export default class AuthController extends AbstractController {
  private router: Router;

  private users: Repository<User>;

  public init(): Router {
    this.router = Router();
    this.users = getRepository(User);

    this.router.post('/signup', this.signUp);

    return this.router;
  }

  private signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.create(req.body);
      await this.users.save(user);
      res.json(user);
    } catch (e) {
      next(e);
    }
  };
}
