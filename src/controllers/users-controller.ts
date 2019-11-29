import { getRepository, Repository } from 'typeorm';
import { ContextNext, DELETE, GET, PUT, Path, PathParam, PreProcessor, Security } from 'typescript-rest';
import { Tags, Response } from 'typescript-rest-swagger';
import { NextFunction } from 'express';
import AbstractController from './abstract-controller';
import { User, UserRole } from '../entities/user-entity';
import { Ring } from '../entities/ring-entity';
import { CustomError } from '../utils/CustomError';
import { addAudit } from '../services/audit-service';
import { auth } from '../services/auth-service';

@Path('users')
@Tags('users')
@Security()
export default class UsersController extends AbstractController {
  private readonly users: Repository<User>;

  public constructor() {
    super();
    this.users = getRepository(User);
    this.setMainEntity(this.users);
  }

  @GET
  @Path('/')
  @Response<User[]>(200, 'List of all users.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async find(): Promise<User[]> {
    return this.users.find();
  }

  @GET
  @Path('/:id')
  @Response<Ring>(200, 'User with passed id.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async findOne(@PathParam('id') id: string): Promise<User> {
    return this.getEntityById<User>(id);
  }

  @DELETE
  @Path('/:id')
  @PreProcessor(auth.role(UserRole.Admin))
  @Response<{ id: string; removed: boolean }>(200, 'User with passed id successfully deleted.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async remove(@PathParam('id') id: string): Promise<{ id: string; removed: boolean }> {
    const user = await this.getEntityById<User>(id);
    await this.users.remove(user);
    return { removed: true, id };
  }

  @PUT
  @Path('/:id')
  @Response<{ id: string; removed: boolean }>(200, 'Password succesfully updated.')
  // eslint-disable-next-line consistent-return
  public async updateUser(
    body: any,
    @PathParam('id') id: string,
    @ContextNext next: NextFunction,
  ): Promise<{ ok: boolean } | void> {
    const { password } = body;
    try {
      if (!id || !password) {
        throw new CustomError('User id and password are required', 400);
      }
      const user: User = (await this.users.findOne({ id })) as User;
      if (!user) {
        throw new CustomError('Non-existent user cannot be authorized', 401);
      }
      await user.setPassword(password);
      await this.users.save(user);
      await addAudit('passChange', '', null, user.id);
      return { ok: true };
    } catch (e) {
      next(e);
    }
  }
}
