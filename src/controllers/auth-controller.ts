import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import passport from 'passport';
import AbstractController from './abstract-controller';
import { User, UserRole } from '../entities/user-entity';
import { RefreshToken } from '../entities/auth-entity';
import { isCorrect } from '../services/user-crypto-service';
import { signTokens, verifyRefreshToken, auth } from '../services/auth-service';
import { addAudit } from '../services/audit-service';

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
    this.router.get('/test', auth.required, auth.role(UserRole.Observer), this.test);

    return this.router;
  }

  private signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.create(req.body);
      await this.users.save(user);
      const { token, refreshToken } = signTokens({ userId: user.id, userRole: user.role });
      await this.tokens.save(new RefreshToken(refreshToken, user.id));
      await addAudit('registration', '', null, user.id);
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
      if (!token) {
        return res.status(400).end();
      }
      await this.tokens.delete(closeAllSessions ? { userId: token.userId } : { token: refreshToken });
      await addAudit('logout', '', null, token.userId);
      return res.send({ ok: true });
    } catch (e) {
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
        await addAudit('login', '', null, user.id);
        return res.json({ user, token: `Bearer ${token}`, refreshToken });
      } catch (e) {
        return next(e);
      }
    })(req, res, next);
  };

  private refresh = async (req: Request, res: Response) => {
    const refreshTokenFromBody: string = req.body.refreshToken;
    if (!refreshTokenFromBody) {
      return res.status(400).end();
    }
    try {
      const { token: oldToken, userId } = (await this.tokens.findOne({ token: refreshTokenFromBody })) as RefreshToken;
      if (!oldToken) {
        return res.status(403).end();
      }
      await this.tokens.delete({ token: oldToken });
      const [, user] = await Promise.all([verifyRefreshToken(refreshTokenFromBody), this.users.findOne(userId)]);
      if (!user) {
        return res.status(403).end();
      }
      const { token, refreshToken } = signTokens({ userId, userRole: user.role });
      await this.tokens.save(new RefreshToken(refreshToken, user.id));
      return res.json({ token: `Bearer ${token}`, refreshToken });
    } catch (e) {
      return res.status(403).end();
    }
  };

  private changePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const user = req.user as User;
    if (!oldPassword || !newPassword || !user) {
      return res.status(400).end();
    }
    const isPasswordCorrect = await isCorrect(oldPassword, user.salt, user.hash);
    if (!isPasswordCorrect) {
      return res.status(400).end();
    }
    try {
      await user.setPassword(newPassword);
      await this.users.save(user);
      await addAudit('passChange', '', null, user.id);
      return res.send({ ok: true });
    } catch (e) {
      return res.status(403).end();
    }
  };

  private test = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.users.find();
    res.json({ users });
  };
}
