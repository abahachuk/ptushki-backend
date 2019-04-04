import passport from 'passport';
import passportLocal from 'passport-local';
import { getRepository, Repository } from 'typeorm';
import { User } from '../entities/user-entity';
// import { getSaltAndHash } from '../services/user-crypto-service';

const LocalStrategy = passportLocal.Strategy;

// const validateUserPassword = async (password: string, origin) => {
//   const { salt, hash } = await getSaltAndHash(password);

// }

export const initPassport = () => {
  const repository: Repository<User> = getRepository(User);
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, pass, done) => {
      const user = await repository.findOne({ email });
      if (user) {
        console.log(user.id);
      }

      console.log('1st argument ', email);
      console.log('2nd argument ', pass);

      return done(null, false);
    }),
  );
};
