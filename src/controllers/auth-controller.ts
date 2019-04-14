import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import passport from 'passport';
import AbstractController from './abstract-controller';
import { User } from '../entities/user-entity';
import { RefreshToken } from '../entities/auth-entity';
import { signTokens, verifyRefreshToken, authRequired } from '../services/auth-service';

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
    this.router.get('/test', authRequired, this.test);

    return this.router;
  }

  private signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).end();
      }
      const existUser = await this.users.findOne({ email });
      if (existUser) {
        return res.status(400).end();
      }
      const user = await User.create(req.body);
      await this.users.save(user);
      const { token, refreshToken } = signTokens({ userId: user.id, userRole: user.role });
      await this.tokens.save(new RefreshToken(refreshToken, user.id));
      return res.json({ user, token: `Bearer ${token}`, refreshToken });
    } catch (e) {
      return next(e);
    }
  };

  private logout = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken, closeAllSessions = false }: { refreshToken: string; closeAllSessions: boolean } = req.body;
    if (!refreshToken) {
      return res.status(400).end();
    }
    try {
      const token = await this.tokens.findOne({ token: refreshToken });
      if (token) {
        if (closeAllSessions) {
          await this.tokens.delete({ userId: token.userId });
          return res.send({ ok: true });
        }
        await this.tokens.delete({ token: refreshToken });
        return res.send({ ok: true });
      }
      return res.status(400).end();
    } catch (e) {
      return next(e);
    }
  };

  private login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).end();
    }
    return passport.authenticate('local', { session: false }, async (error: {}, user: User) => {
      if (error) {
        res.status(401).json({ error });
      } else {
        try {
          const { token, refreshToken } = signTokens({ userId: user.id, userRole: user.role });
          await this.tokens.save(new RefreshToken(refreshToken, user.id));
          res.json({ user, token: `Bearer ${token}`, refreshToken });
        } catch (e) {
          next(e);
        }
      }
    })(req, res, next);
  };

  private refresh = async (req: Request, res: Response) => {
    const refreshTokenFromBody: string = req.body.refreshToken;
    if (refreshTokenFromBody) {
      const refreshTokenOrigin = await this.tokens.findOne({ token: refreshTokenFromBody });
      if (refreshTokenOrigin) {
        try {
          const [payload, user] = await Promise.all([
            verifyRefreshToken(refreshTokenFromBody),
            this.users.findOne(refreshTokenOrigin.userId),
          ]);
          if (!user) {
            await this.tokens.delete({ token: refreshTokenOrigin.token });
            return res.status(403).end();
          }
          await this.tokens.delete({ token: refreshTokenOrigin.token });
          const { token, refreshToken } = signTokens({
            userId: payload.userId,
            userRole: user.role,
          });
          await this.tokens.save(new RefreshToken(refreshToken, user.id));
          return res.json({ token: `Bearer ${token}`, refreshToken });
        } catch (e) {
          /* if token expired or something else */
          await this.tokens.delete({ token: refreshTokenOrigin.token });
          return res.status(403).end();
        }
      }
      return res.status(403).end();
    }
    return res.status(400).end();
  };

  private test = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.users.find();
    res.json({ users });
  };
}
