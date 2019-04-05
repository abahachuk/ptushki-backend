import { Request } from 'express';
import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT from 'passport-jwt';
import { getRepository, Repository } from 'typeorm';
import { User } from '../entities/user-entity';
import { isCorrect } from '../services/user-crypto-service';

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const cookieExtractor = (reg: Request): string => {
  let token = '';
  if (reg.cookies) {
    token = reg.cookies.jwt;
  }
  return token;
};

export const initPassport = (): void => {
  const repository: Repository<User> = getRepository(User);

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        session: false,
      },
      async (email, password, done) => {
        try {
          const user = await repository.findOne({ email });
          let isPasswordCorrect = false;
          if (user) {
            isPasswordCorrect = await isCorrect(password, user.salt, user.hash);
          }
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
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET || 'secret',
      },
      async (jwtPayload: User, done) => {
        const user = await repository.findOne({ id: jwtPayload.id });
        if (user) {
          return done(null, user);
        }
        return done({ message: 'no user' });
      },
    ),
  );
};
