import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

import AbstractController from './abstract-controller';
import { User, UserRole } from '../entities/user-entity';
import { RefreshToken } from '../entities/auth-entity';
import { signTokens, verifyRefreshToken, auth, authenticateLocal } from '../services/auth-service';
import { isCorrect } from '../services/user-crypto-service';
import { addAudit } from '../services/audit-service';
import { CustomError } from '../utils/CustomError';

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
    this.router.post('/change-password', auth.required, this.changePassword);

    /* use auth.required to secure route */
    if (process.env.NODE_ENV !== 'production') {
      this.router.get('/test', auth.required, auth.role(UserRole.Observer), this.test);
      this.router.get('/admin-test', auth.required, auth.role(UserRole.Admin), this.adminTest);
    }

    return this.router;
  }

  private signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.create(req.body);
      await this.users.save(user);
      const { token, refreshToken } = signTokens({ userId: user.id, userRole: user.role });
      await this.tokens.save(new RefreshToken(refreshToken, user.id));
      await addAudit('registration', '', null, user.id);
      return res.json({ user, token, refreshToken });
    } catch (e) {
      if (e.code === '23505') {
        // README with any new user uniq constraint this will become invalid statement
        return next(new CustomError('Such email already exists', 400));
      }
      return next(e);
    }
  };

  private logout = async (req: Request, res: Response, next: NextFunction) => {
    const {
      refreshToken: refreshTokenFromBody,
      closeAllSessions = false,
    }: { refreshToken: string; closeAllSessions: boolean } = req.body;

    try {
      if (!refreshTokenFromBody) {
        throw new CustomError('Refresh token is required', 400);
      }
      const { userId } = await verifyRefreshToken(refreshTokenFromBody);
      const refreshToken = await this.tokens.findOne({ token: refreshTokenFromBody });
      if (!refreshToken) {
        throw new CustomError('Token already was used or never existed', 401);
      }
      await this.tokens.delete(closeAllSessions ? { userId } : { token: refreshTokenFromBody });
      await addAudit('logout', '', null, userId);
      return res.send({ ok: true });
    } catch (e) {
      // README goes first as it is subclass of JsonWebTokenError
      if (e instanceof TokenExpiredError) {
        return next(new CustomError('Token expired', 401));
      }
      if (e instanceof JsonWebTokenError) {
        return next(new CustomError('Token invalid', 401));
      }
      return next(e);
    }
  };

  private login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: User = (await authenticateLocal(req, res)) as User;
      const { token, refreshToken } = signTokens({ userId: user.id, userRole: user.role });
      await this.tokens.save(new RefreshToken(refreshToken, user.id));
      return res.json({ user, token, refreshToken });
    } catch (e) {
      return next(e);
    }
  };

  private refresh = async (req: Request, res: Response, next: NextFunction) => {
    const refreshTokenFromBody: string = req.body.refreshToken;
    try {
      if (!refreshTokenFromBody) {
        throw new CustomError('Refresh token is required', 400);
      }
      const { userId } = await verifyRefreshToken(refreshTokenFromBody);
      const { affected } = await this.tokens.delete({ token: refreshTokenFromBody });
      if (!affected) {
        throw new CustomError('Token already was used or never existed', 401);
      }
      const user = await this.users.findOne(userId);
      if (!user) {
        throw new CustomError('Non-existent user cannot be authorized', 401);
      }
      const { token, refreshToken } = signTokens({ userId, userRole: user.role });
      await this.tokens.save(new RefreshToken(refreshToken, user.id));
      return res.json({ token, refreshToken });
    } catch (e) {
      // README goes first as it is subclass of JsonWebTokenError
      if (e instanceof TokenExpiredError) {
        return next(new CustomError('Token expired', 401));
      }
      if (e instanceof JsonWebTokenError) {
        return next(new CustomError('Token invalid', 401));
      }
      return next(e);
    }
  };

  private changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;
    const user = req.user as User;
    if (!oldPassword || !newPassword || !user) {
      return res.status(400).end();
    }
    const isPasswordCorrect = await isCorrect(oldPassword, user.salt, user.hash);
    if (!isPasswordCorrect) {
      return res.status(401).end();
    }
    try {
      await user.setPassword(newPassword);
      await this.users.save(user);
      await addAudit('passChange', '', null, user.id);
      return res.send({ ok: true });
    } catch (e) {
      return next(e);
    }
  };

  private test = (_req: Request, res: Response): void => {
    res.json({ ok: true });
  };

  private adminTest = (_req: Request, res: Response): void => {
    res.json({ ok: true });
  };
}
