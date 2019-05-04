import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import passport from 'passport';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

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
      const user = await User.create(req.body);
      await this.users.save(user);
      const { token, refreshToken } = signTokens({ userId: user.id, userRole: user.role });
      await this.tokens.save(new RefreshToken(refreshToken, user.id));
      return res.json({ user, token, refreshToken });
    } catch (e) {
      if (e.code === '23505') {
        e.status = 400;
      }
      return next(e);
    }
  };

  private logout = async (req: Request, res: Response, next: NextFunction) => {
    const {
      refreshToken: refreshTokenFromBody,
      closeAllSessions = false,
    }: { refreshToken: string; closeAllSessions: boolean } = req.body;
    if (!refreshTokenFromBody) {
      return res.status(400).end();
    }
    try {
      await verifyRefreshToken(refreshTokenFromBody);
      const refreshToken = await this.tokens.findOne({ token: refreshTokenFromBody });
      if (!refreshToken) {
        return res.status(401).end();
      }
      await this.tokens.delete(closeAllSessions ? { userId: refreshToken.userId } : { token: refreshTokenFromBody });
      return res.send({ ok: true });
    } catch (e) {
      if ([TokenExpiredError, JsonWebTokenError].some(err => e instanceof err)) {
        return res.status(401).end();
      }
      return next(e);
    }
  };

  private login = async (req: Request, res: Response, next: NextFunction) => {
    return passport.authenticate('local', { session: false }, async (error: {}, user: User) => {
      if (error) {
        return res.status(401).json({ error });
      }
      if (!user) {
        return res.status(403).json({ error });
      }
      try {
        const { token, refreshToken } = signTokens({ userId: user.id, userRole: user.role });
        await this.tokens.save(new RefreshToken(refreshToken, user.id));
        return res.json({ user, token, refreshToken });
      } catch (e) {
        return next(e);
      }
    })(req, res, next);
  };

  private refresh = async (req: Request, res: Response, next: NextFunction) => {
    const refreshTokenFromBody: string = req.body.refreshToken;
    if (!refreshTokenFromBody) {
      return res.status(400).end();
    }
    try {
      const { affected } = await this.tokens.delete({ token: refreshTokenFromBody });
      if (!affected) {
        return res.status(401).end();
      }
      const { userId } = await verifyRefreshToken(refreshTokenFromBody);
      const user = await this.users.findOne(userId);
      if (!user) {
        return res.status(401).end();
      }
      const { token, refreshToken } = signTokens({ userId, userRole: user.role });
      await this.tokens.save(new RefreshToken(refreshToken, user.id));
      return res.json({ token, refreshToken });
    } catch (e) {
      if ([TokenExpiredError, JsonWebTokenError].some(err => e instanceof err)) {
        return res.status(401).end();
      }
      return next(e);
    }
  };

  private test = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.users.find();
    res.json({ users });
  };
}
