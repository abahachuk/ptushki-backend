import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import config from 'config';
import passport from 'passport';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import AbstractController from './abstract-controller';
import { User } from '../entities/user-entity';
import { RefreshToken } from '../entities/auth-entity';

const { accessSecret, refreshSecret, accessExpires, refreshExpires } = config.get('auth');

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

    this.router.get('/test', passport.authenticate('jwt', { session: false }), this.test);

    return this.router;
  }

  private singTokens = (user: User): { token: string; refreshToken: string } => {
    const token = jwt.sign({ ...user }, accessSecret, { expiresIn: accessExpires });
    const refreshToken = jwt.sign({ ...user }, refreshSecret, { expiresIn: refreshExpires });
    return { token, refreshToken };
  };

  private signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.create(req.body);
      await this.users.save(user);
      const { token, refreshToken } = await this.singTokens(user);
      await this.tokens.save(new RefreshToken(refreshToken, user));
      res.json({ ...user, token, refreshToken });
    } catch (e) {
      next(e);
    }
  };

  private logout = async (req: Request, res: Response, next: NextFunction) => {
    const { id }: { id: string } = req.body;
    if (id) {
      try {
        const tokens = await this.tokens.find({ user: { id } });
        if (tokens.length) {
          await this.tokens.delete(tokens.map(token => token.id));
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
          const { token, refreshToken } = this.singTokens(user);
          await this.tokens.save(new RefreshToken(refreshToken, user));
          res.json({ ...user, token: `Bearer ${token}`, refreshToken });
        } catch (e) {
          next(e);
        }
      }
    })(req, res, next);
  };

  private refresh = async (req: Request, res: Response, next: NextFunction) => {
    const refreshTokenBody = req.body.refreshToken;
    if (refreshTokenBody) {
      const refreshTokenEntity = await this.tokens.findOne({ token: refreshTokenBody });
      if (refreshTokenEntity) {
        jwt.verify(refreshTokenBody, refreshSecret, async (error: VerifyErrors, refreshTokenPayload: User) => {
          if (error) {
            /* if token expired or something else */
            await this.tokens.delete(refreshTokenEntity.id);
            res.redirect('/login');
          } else {
            try {
              const user = {
                id: refreshTokenPayload.id,
                email: refreshTokenPayload.email,
                role: refreshTokenPayload.role,
                firstName: refreshTokenPayload.firstName,
                lastName: refreshTokenPayload.firstName,
              };
              const { token, refreshToken } = this.singTokens(user as User);
              await this.tokens.update(refreshTokenEntity.id, new RefreshToken(refreshToken, refreshTokenPayload));
              res.json({ ...refreshTokenPayload, token: `Bearer ${token}`, refreshToken });
            } catch (e) {
              next(e);
            }
          }
        });
      } else {
        res.redirect('/login');
      }
    } else {
      res.redirect('/login');
    }
  };

  private test = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.users.find();
    const refreshTokens = await this.tokens.find();
    res.json({ users, refreshTokens });
  };
}
