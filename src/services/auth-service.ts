import config from 'config';
import { getRepository, Repository } from 'typeorm';
import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT, { VerifiedCallback } from 'passport-jwt';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../entities/user-entity';
import { isCorrect } from '../services/user-crypto-service';

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
      async (email: string, password: string, done: (error: {} | null, user?: User) => void) => {
        try {
          const user = await repository.findOne({ email });
          const isPasswordCorrect = user ? await isCorrect(password, user.salt, user.hash) : false;
          if (!user || !isPasswordCorrect) {
            return done({ message: 'email or password is invalid' });
          }
          delete user.hash;
          delete user.salt;
          return done(null, user);
        } catch (e) {
          return done({ message: 'error' });
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

const verify = promisify(jwt.verify);

export const verifyRefreshToken = async (refreshToken: string): Promise<UserPayload> => {
  const { userId, userRole } = (await verify(refreshToken, refreshSecret)) as UserPayload;
  return { userId, userRole };
};

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

export const authRequired = passport.authenticate('jwt', { session: false });
