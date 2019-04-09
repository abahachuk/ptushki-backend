import config from 'config';
import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT, { VerifiedCallback } from 'passport-jwt';
import { getRepository, Repository } from 'typeorm';
import { User } from '../entities/user-entity';
import { isCorrect } from '../services/user-crypto-service';

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const { accessSecret } = config.get('auth');

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
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: accessSecret,
      },
      async (jwtPayload: User, done: VerifiedCallback) => {
        const user = await repository.findOne({ id: jwtPayload.id });
        if (user) {
          return done(null, user);
        }
        return done({ message: 'no user' });
      },
    ),
  );
};
