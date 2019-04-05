import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import passport from 'passport';
import jwt from 'jsonwebtoken';
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

    this.router.post('/signup', this.signUp);
    this.router.post('/login', this.login);
    this.router.get('/test', passport.authenticate('jwt', { session: false }), this.test);

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

  private login = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email) {
      res.status(422).end();
    }
    if (!password) {
      res.status(422).end();
    }
    return passport.authenticate('local', { session: false }, (error, user: User) => {
      if (error) {
        res.status(403).json({ error });
      }
      const token = jwt.sign({ ...user }, process.env.JWT_SECRET || 'secret');
      res.cookie('jwt', token);
      res.json({ ...user, token });
    })(req, res, next);
  };

  private test = (_req: Request, res: Response): void => {
    res.json('test response');
  };
}
