import config from 'config';
import { Request, Response, NextFunction } from 'express';
import { getRepository, Repository } from 'typeorm';
import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT, { VerifiedCallback } from 'passport-jwt';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';

import { User, UserRole } from '../entities/user-entity';
import { isCorrect } from '../services/user-crypto-service';
import { CustomError } from '../utils/CustomError';

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const { accessSecret, refreshSecret, accessExpires, refreshExpires } = config.get('auth');

export interface UserPayload {
  userId: string;
  userRole: UserRole;
}

export const initPassport = (): void => {
  const repository: Repository<User> = getRepository(User);

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        session: false,
      },
      async (email: string, password: string, done: (error: null | CustomError, user?: User) => void) => {
        try {
          const user = await repository.findOne({ email });
          const isPasswordCorrect = user ? await isCorrect(password, user.salt, user.hash) : false;
          if (!user || !isPasswordCorrect) {
            return done(new CustomError('Email or password is invalid', 401));
          }
          delete user.hash;
          delete user.salt;
          return done(null, user);
        } catch (e) {
          return done(new CustomError('Authorization Error', 401));
        }
      },
    ),
  );

  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: accessSecret,
      },
      async (jwtPayload: UserPayload, done: VerifiedCallback) => {
        const user = await repository.findOne({ id: jwtPayload.userId });
        if (user) {
          return done(null, user);
        }
        return done({ message: 'no user' });
      },
    ),
  );
};

type AccessLevels = { [key in UserRole]: number };

export const userAccessLevels: AccessLevels = {
  observer: 1,
  ringer: 2,
  scientist: 4,
  moderator: 8,
  admin: 16,
};

/* eslint-disable */
export const userAccessLevelsMask: AccessLevels = {
  observer:
    userAccessLevels.observer |
    userAccessLevels.ringer |
    userAccessLevels.scientist |
    userAccessLevels.moderator |
    userAccessLevels.admin,
  ringer: userAccessLevels.ringer | userAccessLevels.scientist | userAccessLevels.moderator | userAccessLevels.admin,
  scientist: userAccessLevels.scientist | userAccessLevels.moderator | userAccessLevels.admin,
  moderator: userAccessLevels.moderator | userAccessLevels.admin,
  admin: userAccessLevels.admin,
};

const verify = promisify(jwt.verify);

export const verifyRefreshToken = async (refreshToken: string): Promise<UserPayload> => {
  const { userId, userRole } = (await verify(refreshToken, refreshSecret)) as UserPayload;
  return { userId, userRole };
};

export const authenticateLocal = (req: Request, res: Response): Promise<User | Error> =>
  new Promise((resolve, reject) => {
    passport.authenticate('local', { session: false }, (err: Error, user: User) => {
      if (err) reject(err);
      resolve(user);
    })(req, res);
  });

export const signTokens = (
  payload: UserPayload,
  {
    accessExpiresIn = accessExpires,
    refreshExpiresIn = refreshExpires,
  }: { accessExpiresIn?: number | string; refreshExpiresIn?: number | string } = {},
): { token: string; refreshToken: string } => {
  const token = `Bearer ${jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn })}`;
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiresIn });
  return { token, refreshToken };
};

const checkUserRole = (userRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    if (!user) {
      return res.status(400).end();
    }
    if (userAccessLevels[user.role] & userAccessLevelsMask[userRole]) {
      return next();
    }
    return res.status(403).end();
  };
};
/* eslint-enable */

export const auth = {
  required: passport.authenticate('jwt', { session: false }),
  role: checkUserRole,
};

export const sanitizeUser = (user: User) => {
  const ref = user;
  delete ref.id;
  delete ref.hash;
  delete ref.salt;
  return ref;
};
