import { NextFunction, Request, Response } from 'express';
import { getRepository, Repository } from 'typeorm';
import { User } from '../../entities/User';

interface RequestWithUser extends Request {
  user: User;
}

export default class UsersControler {
  private users: Repository<User> = getRepository(User);

  public async checkId(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id }: { id: string } = req.params;
    try {
      if (id.length !== 24) {
        throw new Error(`Provided player identificator (${id}) is incorrect`);
      }
      const user = await this.users.findOne(id);
      if (!user) {
        throw new Error(`User with ${id} not exists`);
      }
      Object.assign(req, { user });
      next();
    } catch (e) {
      next(e);
    }
  }

  public async find(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.users.find();
      res.json(users);
    } catch (e) {
      next(e);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public findOne(req: RequestWithUser, res: Response, next: NextFunction): void {
    const { user }: { user: User } = req;
    try {
      res.json(user);
    } catch (e) {
      next(e);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = User.create(req.body);
      await this.users.save(user);
      res.json(user);
    } catch (e) {
      next(e);
    }
  }

  public async remove(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    const { user }: { user: User } = req;
    try {
      await this.users.remove(user);
      res.json({ id: user.id, removed: true });
    } catch (e) {
      next(e);
    }
  }
}
