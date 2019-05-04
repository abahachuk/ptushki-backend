import request from 'supertest';
import { Application } from 'express';
import { Connection, getRepository, Repository } from 'typeorm';
import createApp from '../app';
import connectDB from '../db';
import { signTokens } from '../services/auth-service';
import { UserRole, User } from '../entities/user-entity';
import { RefreshToken } from '../entities/auth-entity';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let connection: Connection | undefined;
let app: Application;

const urls: { [index: string]: string } = {
  login: '/auth/login',
  signup: '/auth/signup',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  test: '/auth/test',
};

jest.setTimeout(30000);

let tokenRepository: Repository<RefreshToken>;
let userRepository: Repository<User>;

beforeAll(async () => {
  connection = await connectDB();
  app = await createApp();
  tokenRepository = getRepository(RefreshToken);
  userRepository = getRepository(User);
});

afterAll(async () => {
  if (connection) {
    await connection.dropDatabase();
    await connection.close();
  }
});

describe('Auth', () => {
  describe('on signup route user have to:', () => {
    const email = 'signup-test@mail.com';
    const password = '12345';

    it('be able to signup with email & password', async () => {
      const res = await request(app)
        .post(urls.signup)
        .set('Accept', 'application/json')
        .send({ password, email });

      expect(res.status).toEqual(200);
      expect(res.body.user).toEqual(expect.any(Object));
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
    });

    it('be not able to signup with the same email twice', async () => {
      const res = await request(app)
        .post(urls.signup)
        .set('Accept', 'application/json')
        .send({ password, email });

      expect(res.status).toEqual(400);
    });
  });

  describe('on login route user have to:', () => {
    const email = 'login-test@mail.com';
    const password = '12345';

    beforeAll(async () => {
      const user = await User.create({ email, password });
      await userRepository.save(user);
    });

    it('login with true credentials and get tokens', async () => {
      const res = await request(app)
        .post(urls.login)
        .set('Accept', 'application/json')
        .send({ password, email });

      expect(res.status).toEqual(200);
      expect(res.body.user).toEqual(expect.any(Object));
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
    });

    it('get 401 on invalid password', async () => {
      const res = await request(app)
        .post(urls.login)
        .set('Accept', 'application/json')
        .send({ password: 'Invalid', email });

      expect(res.status).toEqual(401);
    });

    it('get 401 on invalid email', async () => {
      const res = await request(app)
        .post(urls.login)
        .set('Accept', 'application/json')
        .send({ password, email: 'invalid email' });

      expect(res.status).toEqual(401);
    });
  });

  describe('on refresh route user have to:', () => {
    let user: User;
    let userId: string;
    const email = 'refresh-test@mail.com';
    const password = '12345';

    beforeAll(async () => {
      user = await User.create({ email, password });
      user = await userRepository.save(user);
      ({ id: userId } = user);
    });

    it('get 200 and update accessToken if he has refreshToken', async () => {
      const { refreshToken } = signTokens({ userId, userRole: UserRole.Admin });
      await tokenRepository.save(new RefreshToken(refreshToken, userId));

      const res = await request(app)
        .post(urls.refresh)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(200);
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
    });

    it('get 401 if user trying to refresh old token again', async () => {
      const { refreshToken } = signTokens({ userId, userRole: UserRole.Admin });
      await tokenRepository.save(new RefreshToken(refreshToken, userId));

      const res = await request(app)
        .post(urls.refresh)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(200);

      const res2 = await request(app)
        .post(urls.refresh)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res2.status).toEqual(401);
    });

    it('get 401 if refreshToken is expired', async () => {
      const { refreshToken } = signTokens({ userId, userRole: UserRole.Admin }, { refreshExpiresIn: '-1s' });
      await tokenRepository.save(new RefreshToken(refreshToken, userId));

      const res = await request(app)
        .post(urls.refresh)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(401);
    });

    it('get 401 if refreshToken is invalid', async () => {
      const refreshToken = 'invalidToken';

      const res = await request(app)
        .post(urls.refresh)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(401);
    });

    it('should not refresh tokens without refreshToken', async () => {
      const res = await request(app)
        .post(urls.refresh)
        .set('Accept', 'application/json')
        .send();

      expect(res.status).toEqual(400);
    });
  });

  describe('on logout route user have to:', () => {
    let user: User;
    let userId: string;
    const email = 'logout-test@mail.com';
    const password = '12345';

    beforeAll(async () => {
      user = await User.create({ email, password });
      user = await userRepository.save(user);
      ({ id: userId } = user);
    });
    it('get 200 and reset refreshToken', async () => {
      const { refreshToken } = signTokens({ userId, userRole: UserRole.Admin });
      await tokenRepository.save(new RefreshToken(refreshToken, userId));

      const res = await request(app)
        .post(urls.logout)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(200);

      const res2 = await request(app)
        .post(urls.refresh)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res2.status).toEqual(401);
    });

    it('get 401 if refreshToken is invalid', async () => {
      const refreshToken = 'invalidToken';

      const res = await request(app)
        .post(urls.logout)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(401);
    });

    it('get 400 if refreshToken is not provided', async () => {
      const res = await request(app)
        .post(urls.logout)
        .set('Accept', 'application/json')
        .send();

      expect(res.status).toEqual(400);
    });

    it('get 401 if refreshToken is expired', async () => {
      const { refreshToken } = signTokens({ userId, userRole: UserRole.Admin }, { refreshExpiresIn: '-1s' });
      await tokenRepository.save(new RefreshToken(refreshToken, userId));

      const res = await request(app)
        .post(urls.logout)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(401);
    });
  });

  describe('on multidevices', () => {
    let user: User;
    let userId: string;
    let userRole: UserRole;
    const email = 'multi-test@mail.com';
    const password = '12345';

    beforeAll(async () => {
      user = await User.create({ email, password });
      user = await userRepository.save(user);
      ({ id: userId, role: userRole } = user);
    });

    it('should be able to login. And then refresh his access independently', async () => {
      const logins = await Promise.all(
        [0, 1100].map(n =>
          // README jsonwebtoken cant handle ms precision for timestamps
          // that can cause refresh tokens collisions if somebody simultaneously login
          // FIXME can be resolved easy by some kind of fingerprints
          delay(n).then(() =>
            request(app)
              .post(urls.login)
              .set('Accept', 'application/json')
              .send({ password, email }),
          ),
        ),
      );

      logins.forEach(({ status }) => {
        expect(status).toEqual(200);
      });

      const refreshes = await Promise.all(
        logins.map(({ body: { refreshToken } }) =>
          request(app)
            .post(urls.refresh)
            .set('Accept', 'application/json')
            .send({ refreshToken }),
        ),
      );

      refreshes.forEach(({ status, body: { token, refreshToken } }) => {
        expect(status).toEqual(200);
        expect(token).toEqual(expect.any(String));
        expect(refreshToken).toEqual(expect.any(String));
      });
    });

    it('should be able to logout from all devices (if change password etc.)', async () => {
      const tokenPairs: { token: string; refreshToken: string }[] = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const value of [0, 1100, 2200]) {
        // eslint-disable-next-line no-await-in-loop
        await delay(value);
        const pair = signTokens({ userId, userRole });
        // eslint-disable-next-line no-await-in-loop
        await tokenRepository.save(new RefreshToken(pair.refreshToken, userId));
        tokenPairs.push(pair);
      }

      const clientToLogout = 0;
      const pair = tokenPairs[clientToLogout];

      (await Promise.all(
        tokenPairs.map(({ token }) =>
          request(app)
            .get(urls.test)
            .set('Accept', 'application/json')
            .set('Authorization', token),
        ),
      )).forEach(({ status }) => expect(status).toEqual(200));

      await request(app)
        .post(urls.logout)
        .set('Accept', 'application/json')
        .send({
          refreshToken: pair.refreshToken,
          closeAllSessions: true,
        });

      (await Promise.all(
        tokenPairs.map(({ refreshToken }) =>
          request(app)
            .post(urls.refresh)
            .send({ refreshToken }),
        ),
      )).forEach(({ status }) => expect(status).toEqual(401));
    });

    it('should be able to logout independently by each token', async () => {
      const tokenPairs: { token: string; refreshToken: string }[] = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const value of [0, 1100, 2200]) {
        // eslint-disable-next-line no-await-in-loop
        await delay(value);
        const pair = signTokens({ userId, userRole });
        // eslint-disable-next-line no-await-in-loop
        await tokenRepository.save(new RefreshToken(pair.refreshToken, userId));
        tokenPairs.push(pair);
      }

      const clientToLogout = 0;
      const pair = tokenPairs[clientToLogout];

      (await Promise.all(
        tokenPairs.map(({ token }) =>
          request(app)
            .get(urls.test)
            .set('Accept', 'application/json')
            .set('Authorization', token),
        ),
      )).forEach(({ status }) => expect(status).toEqual(200));

      await request(app)
        .post(urls.logout)
        .set('Accept', 'application/json')
        .send({
          refreshToken: pair.refreshToken,
          closeAllSessions: false,
        });

      (await Promise.all(
        tokenPairs.map(({ refreshToken }) =>
          request(app)
            .post(urls.refresh)
            .send({ refreshToken }),
        ),
      )).forEach(({ status }, i) => expect(status).toEqual(i === clientToLogout ? 401 : 200));
    });
  });
});
