import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUserDto, User } from '../entities/user-entity';
import { DatabaseException, DataBaseExceptionStatus } from '../database/database.exception';

@Injectable()
class UsersService {
  private readonly users: Repository<User>;

  public constructor(
    @Inject('USER_REPOSITORY')
    users: Repository<User>,
  ) {
    this.users = users;
  }

  // @ts-ignore
  // eslint-disable-next-line consistent-return
  public async find(): Promise<User[]> {
    try {
      return await this.users.find();
    } catch (e) {
      console.error(e);
    }
  }

  // @ts-ignore
  // eslint-disable-next-line consistent-return
  public async findOne(email: string) {
    try {
      return await this.users.findOne({ email });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  public async create(user: CreateUserDto) {
    try {
      const newUser = await User.create(user);
      return await this.users.save(newUser);
    } catch (e) {
      if (e.code === '23505') {
        // README with any new user uniq constraint this will become invalid statement
        throw new DatabaseException('Such email already exists', DataBaseExceptionStatus.UNIQUE_CONSTRAINT);
      }
      throw e;
    }
  }
}

export default UsersService;
