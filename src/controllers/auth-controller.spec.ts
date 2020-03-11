/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import request from 'supertest';
import { Application } from 'express';
import { Connection, getRepository, Repository } from 'typeorm';
import createApp from '../app';
import connectDB from '../db';
import { signTokens, signResetToken } from '../services/auth-service';
import { getMailServiceInstance, MailService } from '../services/mail-service';
import { UserRole, User, CreateUserDto } from '../entities/user-entity';
import { RefreshToken } from '../entities/auth-entity';
import { ResetToken } from '../entities/reset-token';

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

let connection: Connection | undefined;
let app: Application;

const urls: { [index: string]: string } = {
  login: '/auth/login',
  signup: '/auth/signup',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  forgot: '/auth/forgot',
  reset: '/auth/reset',
  changePass: '/change-password',
  test: '/auth/test',
  adminTest: '/auth/admin-test',
};

jest.setTimeout(30000);

let tokenRepository: Repository<RefreshToken>;
let userRepository: Repository<User>;
let resetTokenRepository: Repository<ResetToken>;
let mailServise: MailService;

let spyOnSendChangeRequestMail: jest.SpyInstance<Promise<void>, [string, string]>;
let spyOnSendResetCompleteMail: jest.SpyInstance<Promise<void>, [string]>;

beforeAll(async () => {
  connection = await connectDB();
  app = await createApp();
  tokenRepository = getRepository(RefreshToken);
  userRepository = getRepository(User);
  resetTokenRepository = getRepository(ResetToken);
  mailServise = getMailServiceInstance();

  spyOnSendChangeRequestMail = jest.spyOn(mailServise, 'sendChangeRequestMail');
  spyOnSendResetCompleteMail = jest.spyOn(mailServise, 'sendResetCompleteMail');
});

afterAll(async () => {
  if (connection) {
    await connection.dropDatabase();
    await connection.close();
  }
});

describe('Auth', () => {
  describe('on signup route user should:', () => {
    const email = 'signup-test@mail.com';
    const password = '12345';

    it('be able to signup with email & password', async () => {
      const res = await request(app)
        .post(urls.signup)
        .set('Accept', 'application/json')
        .send({ password, email });

      expect(res.status).toEqual(200);
      expect(res.body.user).toEqual(expect.any(Object));
      expect(res.body.user.hash).not.toBeDefined();
      expect(res.body.user.salt).not.toBeDefined();
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
    });

    it('not be able to signup with the same email twice', async () => {
      const res = await request(app)
        .post(urls.signup)
        .set('Accept', 'application/json')
        .send({ password, email });

      expect(res.status).toEqual(400);
    });
  });

  describe('on login route user should:', () => {
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
      expect(res.body.user.hash).not.toBeDefined();
      expect(res.body.user.salt).not.toBeDefined();
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
    });

    it('not login with invalid password and get 401', async () => {
      const res = await request(app)
        .post(urls.login)
        .set('Accept', 'application/json')
        .send({ password: 'Invalid', email });

      expect(res.status).toEqual(401);
    });

    it('not login with invalid email and get 401', async () => {
      const res = await request(app)
        .post(urls.login)
        .set('Accept', 'application/json')
        .send({ password, email: 'invalid email' });

      expect(res.status).toEqual(401);
    });
  });

  describe('on refresh route user should:', () => {
    let user: User;
    let userId: string;
    const email = 'refresh-test@mail.com';
    const password = '12345';

    beforeAll(async () => {
      user = await User.create({ email, password });
      user = await userRepository.save(user);
      ({ id: userId } = user);
    });

    it('be able to refresh tokens when send valid refresh token and get 200', async () => {
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

    it('not be able to refresh tokens when sending refresh token twice and get 401', async () => {
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

    it('not be able to refresh tokens if token is expired and get 401', async () => {
      const { refreshToken } = signTokens({ userId, userRole: UserRole.Admin }, { refreshExpiresIn: '-1s' });
      await tokenRepository.save(new RefreshToken(refreshToken, userId));

      const res = await request(app)
        .post(urls.refresh)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(401);
    });

    it('not be able to refresh tokens if token is malformed or faked and get 401', async () => {
      const refreshToken = 'invalidToken';

      const res = await request(app)
        .post(urls.refresh)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(401);
    });

    it('not be able to refresh tokens without refreshToken and get 400', async () => {
      const res = await request(app)
        .post(urls.refresh)
        .set('Accept', 'application/json')
        .send();

      expect(res.status).toEqual(400);
    });
  });

  describe('on logout route user should:', () => {
    let user: User;
    let userId: string;
    const email = 'logout-test@mail.com';
    const password = '12345';

    beforeAll(async () => {
      user = await User.create({ email, password });
      user = await userRepository.save(user);
      ({ id: userId } = user);
    });

    it('logout with valid refresh token and unvalidate it', async () => {
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

    it('fail to logout if refreshToken is malformed or faked, and get 401', async () => {
      const refreshToken = 'invalidToken';

      const res = await request(app)
        .post(urls.logout)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(401);
    });

    it("fail to logout if refreshToken isn't provided, and get 400", async () => {
      const res = await request(app)
        .post(urls.logout)
        .set('Accept', 'application/json')
        .send();

      expect(res.status).toEqual(400);
    });

    it('fail to logout if refreshToken is expired, and get 401', async () => {
      const { refreshToken } = signTokens({ userId, userRole: UserRole.Admin }, { refreshExpiresIn: '-1s' });
      await tokenRepository.save(new RefreshToken(refreshToken, userId));

      const res = await request(app)
        .post(urls.logout)
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(401);
    });
  });

  describe('on multiply devices user should:', () => {
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

    it('login independently. And then refresh his access independently on each', async () => {
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

    it('logout from all devices (if change password etc.). And not be able to refresh tokens on each device then', async () => {
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

    it('logout independently by each token', async () => {
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

  describe('protected routes should:', () => {
    let observer: User;
    let admin: User;
    const observerEmail = 'observer@mail.com';
    const adminEmail = 'admin@mail.com';
    const password = '12345';
    let tokenPairs: { token: string; refreshToken: string }[] = [];

    beforeAll(async () => {
      [observer, admin] = await Promise.all(
        [{ email: observerEmail, password }, { email: adminEmail, password, role: UserRole.Admin }].map(
          (creds: CreateUserDto) => User.create(creds).then(newUser => userRepository.save(newUser)),
        ),
      );
      tokenPairs = [observer, admin].map(({ id, role }) => signTokens({ userId: id, userRole: role }));
    });

    it('allow to any authenticated user access route with minimal access required (Observer level)', async () => {
      (await Promise.all(
        tokenPairs.map(({ token }) =>
          request(app)
            .get(urls.test)
            .set('Accept', 'application/json')
            .set('Authorization', token),
        ),
      )).forEach(({ status }) => expect(status).toEqual(200));
    });

    it("not allow access admin's route for observer", async () => {
      const observerToken = tokenPairs[0].token;
      const { status } = await request(app)
        .get(urls.adminTest)
        .set('Accept', 'application/json')
        .set('Authorization', observerToken);
      expect(status).toEqual(403);
    });

    it("allow access admin's route for admin", async () => {
      const adminToken = tokenPairs[1].token;
      const { status } = await request(app)
        .get(urls.adminTest)
        .set('Accept', 'application/json')
        .set('Authorization', adminToken);
      expect(status).toEqual(200);
    });
  });

  describe('forgotten password flow', () => {
    const firstUserEmail = 'forgot-password@mail.com';
    const firstUserpassword = '12345';
    let firstUser: User;

    const secondUserEmail = 'second-forgot-password@mail.com';
    const secondUserpassword = '54321';
    let secondUser: User;

    beforeAll(async () => {
      [firstUser, secondUser] = await Promise.all(
        [
          { email: firstUserEmail, password: firstUserpassword },
          { email: secondUserEmail, password: secondUserpassword },
        ].map((creds: CreateUserDto) => User.create(creds)),
      );
      await Promise.all([firstUser, secondUser].map(user => userRepository.save(user)));
    });

    beforeEach(() => {
      spyOnSendChangeRequestMail.mockClear();
    });

    it('be able to generate reset token and send it via mail service', async () => {
      const res = await request(app)
        .post(urls.forgot)
        .set('Accept', 'application/json')
        .send({ email: firstUserEmail });

      const resetTokens = await resetTokenRepository.find({ userId: firstUser.id });
      expect(res.status).toEqual(200);
      expect(res.body.ok).toEqual(true);
      expect(resetTokens.length).toEqual(1);
      expect(spyOnSendChangeRequestMail).toHaveBeenCalledWith(resetTokens[0].token, firstUserEmail);
    });

    it('be able to generate reset token and overwrite existing if it exists', async () => {
      const firstResponse = await request(app)
        .post(urls.forgot)
        .set('Accept', 'application/json')
        .send({ email: secondUserEmail });

      expect(firstResponse.status).toEqual(200);
      expect(firstResponse.body.ok).toEqual(true);

      const firstTryResetTokens = await resetTokenRepository.find({ userId: secondUser.id });

      const secondResponse = await delay(1000).then(() =>
        request(app)
          .post(urls.forgot)
          .set('Accept', 'application/json')
          .send({ email: secondUserEmail }),
      );

      expect(secondResponse.status).toEqual(200);
      expect(secondResponse.body.ok).toEqual(true);

      const secondTryResetTokens = await resetTokenRepository.find({ userId: secondUser.id });

      expect(secondTryResetTokens.length).toEqual(1);
      expect(secondTryResetTokens[0].token).not.toEqual(firstTryResetTokens[0].token);
    });
  });

  describe('reset password flow', () => {
    const firstUserEmail = 'reset-password-test@mail.com';
    const firstUserPassword = '12345';
    const firstUserNewPassword = 'newPasword';
    let firstUser: User;
    let firstUserResetToken: string;

    const secondUserEmail = 'reset-password-expired@mail.com';
    const secondUserPassword = '45678';
    let secondUser: User;
    let expiredResetToken: string;

    beforeAll(async () => {
      [firstUser, secondUser] = await Promise.all(
        [
          { email: firstUserEmail, password: firstUserPassword },
          { email: secondUserEmail, password: secondUserPassword },
        ].map(creds => User.create(creds)),
      );
      await Promise.all([firstUser, secondUser].map(user => userRepository.save(user)));

      firstUserResetToken = signResetToken({ email: firstUserEmail, userId: firstUser.id });
      expiredResetToken = signResetToken({ email: secondUserEmail, userId: secondUser.id }, -1);

      await Promise.all(
        [{ user: firstUser, token: firstUserResetToken }, { user: secondUser, token: expiredResetToken }].map(
          ({ user, token }) => resetTokenRepository.save(new ResetToken(token, user.id)),
        ),
      );
    });

    beforeEach(() => {
      spyOnSendResetCompleteMail.mockClear();
    });

    it('trying to reset without new password', async () => {
      const res = await request(app)
        .post(urls.reset)
        .set('Accept', 'application/json')
        .send({ token: firstUserResetToken });
      const token = await resetTokenRepository.findOne({ token: firstUserResetToken });
      expect(res.status).toEqual(400);
      expect(token).toBeDefined();
      expect(token!.token).toEqual(firstUserResetToken);
      expect(JSON.parse(res.text).error).toEqual('Reset token and passwords are required');
      expect(spyOnSendResetCompleteMail).not.toHaveBeenCalled();
    });

    it('trying to reset without reset token', async () => {
      const res = await request(app)
        .post(urls.reset)
        .set('Accept', 'application/json')
        .send({ password: firstUserPassword });
      const token = await resetTokenRepository.findOne({ token: firstUserResetToken });
      expect(res.status).toEqual(400);
      expect(token).toBeDefined();
      expect(token!.token).toEqual(firstUserResetToken);
      expect(JSON.parse(res.text).error).toEqual('Reset token and passwords are required');
      expect(spyOnSendResetCompleteMail).not.toHaveBeenCalled();
    });

    it('check that password was reset succefully and reset toket was deleted', async () => {
      const response = await request(app)
        .post(urls.reset)
        .set('Accept', 'application/json')
        .send({ token: firstUserResetToken, password: firstUserNewPassword });

      const sameToken = await resetTokenRepository.findOne({ userId: firstUser.id });
      const sameUser = await userRepository.findOne({ id: firstUser.id });

      if (!sameUser) {
        throw new Error('user should exist');
      }

      expect(response.status).toEqual(200);
      expect(response.body.ok).toEqual(true);
      expect(response.status).toEqual(200);
      expect(sameToken).not.toBeDefined();
      expect(sameUser).toBeDefined();
      expect(spyOnSendResetCompleteMail).toHaveBeenCalled();

      const loginResponse = await request(app)
        .post(urls.login)
        .set('Accept', 'application/json')
        .send({ email: firstUserEmail, password: firstUserNewPassword });

      expect(loginResponse.status).toEqual(200);
    });

    it('trying to reset password with already used reset token', async () => {
      const res = await request(app)
        .post(urls.reset)
        .set('Accept', 'application/json')
        .send({ token: firstUserResetToken, password: firstUserPassword });

      const token = await resetTokenRepository.findOne({ token: firstUserResetToken });

      expect(res.status).toEqual(401);
      expect(token).not.toBeDefined();
      expect(JSON.parse(res.text).error).toEqual('Token already was used or never existed');
      expect(spyOnSendResetCompleteMail).not.toHaveBeenCalled();

      const loginResponse = await request(app)
        .post(urls.login)
        .set('Accept', 'application/json')
        .send({ email: firstUserEmail, password: firstUserNewPassword });

      expect(loginResponse.status).toEqual(200);
    });

    it('trying to use expired token', async () => {
      const res = await request(app)
        .post(urls.reset)
        .set('Accept', 'application/json')
        .send({ token: expiredResetToken, password: 'newPasword' });

      expect(res.status).toEqual(401);
      expect(JSON.parse(res.text).error).toEqual('Token expired');
      expect(spyOnSendResetCompleteMail).not.toHaveBeenCalled();
    });
  });
});
