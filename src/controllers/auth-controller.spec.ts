import request from 'supertest';
import { Application } from 'express';
import { Connection, getRepository, Repository } from 'typeorm';
import createApp from '../app';
import connectDB from '../db';
import { signTokens } from '../services/auth-service';
import { UserRole } from '../entities/user-entity';
import { RefreshToken } from '../entities/auth-entity';

let connection: Connection | undefined;
let app: Application;

const email = 'test@mail.com';
const password = '12345';
const userId = 'ce6d8013-12bf-4788-a585-d2a79cfeb177';

jest.setTimeout(30000);

let tokensDb: Repository<RefreshToken>;

beforeAll(async () => {
  connection = await connectDB();
  app = await createApp();
  tokensDb = await getRepository(RefreshToken);
});

afterAll(async () => {
  if (connection) {
    await connection.dropDatabase();
    await connection.close();
  }
});

describe('Auth', () => {
  describe('on signup route user have to:', () => {
    it('be able to signup with email & password', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send({ password, email });

      expect(res.status).toEqual(200);
      expect(res.body.user).toEqual(expect.any(Object));
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
    });

    it('be not able to signup with the same email twice', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send({ password, email });

      expect(res.status).toEqual(400);
    });
  });

  describe('on login route user have to:', () => {
    it('login with true credentials and get tokens', async () => {
      const res = await request(app)
        .post('/auth/login')
        .set('Accept', 'application/json')
        .send({ password, email });

      expect(res.status).toEqual(200);
      expect(res.body.user).toEqual(expect.any(Object));
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
    });

    it('get 401 on invalid password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .set('Accept', 'application/json')
        .send({ password: 'Invalid', email });

      expect(res.status).toEqual(401);
    });

    it('get 401 on invalid email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .set('Accept', 'application/json')
        .send({ password, email: 'invalid email' });

      expect(res.status).toEqual(401);
    });
  });

  describe('on refresh route user have to:', async () => {
    it('get 200 and update accessToken if he has refreshToken', async () => {
      const { refreshToken } = signTokens({ userId, userRole: UserRole.Admin });
      await tokensDb.save(new RefreshToken(refreshToken, userId));

      const res = await request(app)
        .post('/auth/refresh')
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(200);
      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));
    });

    it('get 404 if user trying to refresh old token again', async () => {
      const { refreshToken } = signTokens({ userId, userRole: UserRole.Admin });
      await tokensDb.save(new RefreshToken(refreshToken, userId));

      const res = await request(app)
        .post('/auth/refresh')
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(404);
      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.refreshToken).toEqual(expect.any(String));

      const res2 = await request(app)
        .post('/auth/refresh')
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res2.status).toEqual(404);
    });

    it('get 401 if refreshToken is expired', async () => {
      const { refreshToken } = signTokens(
        { userId, userRole: UserRole.Admin },
        { accessExpiresIn: 1, refreshExpiresIn: 1 },
      );
      await tokensDb.save(new RefreshToken(refreshToken, userId));

      const res = await request(app)
        .post('/auth/refresh')
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(401);
    });

    it('get 403 if refreshToken is invalid', async () => {
      const refreshToken = 'invalidToken';

      const res = await request(app)
        .post('/auth/refresh')
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(403);
    });

    it('should not refresh tokens without refreshToken', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .set('Accept', 'application/json')
        .send();

      expect(res.status).toEqual(400);
    });
  });

  describe('on logout route user have to:', () => {
    it('get 200 and reset accessToken + refreshToken if accessToken is valid', async () => {
      const { refreshToken } = signTokens({ userId, userRole: UserRole.Admin });
      await tokensDb.save(new RefreshToken(refreshToken, userId));

      const res = await request(app)
        .post('/auth/logout')
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(200);

      const token = await tokensDb.findOne({ token: refreshToken });
      expect(token).toEqual(undefined);
    });

    it('get 403 if refreshToken is invalid', async () => {
      const refreshToken = 'invalidToken';

      const res = await request(app)
        .post('/auth/logout')
        .set('Accept', 'application/json')
        .send({ refreshToken });

      expect(res.status).toEqual(403);
    });

    it('get 403 if refreshToken is not provided', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .set('Accept', 'application/json')
        .send();

      expect(res.status).toEqual(403);
    });
  });
});
