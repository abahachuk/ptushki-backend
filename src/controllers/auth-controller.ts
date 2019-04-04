import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { User } from '../entities/user-entity';
import { validateSchema } from '../validation';
import { Registration } from '../validation/user-schema';

export default class AuthController extends AbstractController {
  private router: Router;

  private users: Repository<User>;

  public init(): Router {
    this.router = Router();
    this.users = getRepository(User);
    // @ts-ignore
    this.router.post('/signup', validateSchema(Registration), this.signUp);

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
