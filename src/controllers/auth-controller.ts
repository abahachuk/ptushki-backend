import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import passport from 'passport';
import AbstractController from './abstract-controller';
import { User } from '../entities/user-entity';
import { RefreshToken } from '../entities/auth-entity';
import { signTokens, verifyRefreshToken, auth } from '../services/auth-service';

export default class AuthController extends AbstractController {
  private router: Router;

  private users: Repository<User>;

  private tokens: Repository<RefreshToken>;

  public init(): Router {
    this.router = Router();
    this.users = getRepository(User);
    this.tokens = getRepository(RefreshToken);

    this.router.post('/signup', this.signUp);
    this.router.post('/logout', this.logout);
    this.router.post('/login', this.login);
    this.router.post('/refresh', this.refresh);

    /* use auth.required to secure route */
    this.router.get('/test', auth.required, this.test);

    return this.router;
  }

  private signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.create(req.body);
      await this.users.save(user);
      const { token, refreshToken } = signTokens({ userId: user.id, userRole: user.role });
      await this.tokens.save(new RefreshToken(refreshToken));
      res.json({ user, token: `Bearer ${token}`, refreshToken });
    } catch (e) {
      next(e);
    }
  };

  private logout = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken }: { refreshToken: string } = req.body;
    if (refreshToken) {
      try {
        const token = await this.tokens.findOne({ token: refreshToken });
        if (token) {
          await this.tokens.delete(token.id);
          res.status(200).end();
        }
      } catch (e) {
        next(e);
      }
    }
    res.status(400).end();
  };

  private login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(403).end();
    }
    return passport.authenticate('local', { session: false }, async (error: {}, user: User) => {
      if (error) {
        res.status(403).json({ error });
      } else {
        try {
          const { token, refreshToken } = signTokens({ userId: user.id, userRole: user.role });
          await this.tokens.save(new RefreshToken(refreshToken));
          res.json({ user, token: `Bearer ${token}`, refreshToken });
        } catch (e) {
          next(e);
        }
      }
    })(req, res, next);
  };

  private refresh = async (req: Request, res: Response) => {
    const refreshTokenFromBody: string = req.body.refreshToken;
    const refreshTokenOrigin = await this.tokens.findOne({ token: refreshTokenFromBody });
    if (refreshTokenFromBody && refreshTokenOrigin) {
      try {
        const payload = await verifyRefreshToken(refreshTokenFromBody);
        const user = await this.users.findOne(payload.userId);
        const { token, refreshToken } = signTokens({
          userId: payload.userId,
          userRole: user ? user.role : payload.userRole,
        });
        await this.tokens.update(refreshTokenOrigin.id, new RefreshToken(refreshToken));
        res.json({ token: `Bearer ${token}`, refreshToken });
      } catch (e) {
        /* if token expired or something else */
        await this.tokens.delete(refreshTokenOrigin.id);
        res.status(403).end();
      }
    } else {
      res.status(403).end();
    }
  };

  private test = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.users.find();
    res.json({ users });
  };
}
