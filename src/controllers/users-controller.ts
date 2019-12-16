import { Request } from 'express';
import { getRepository, Repository } from 'typeorm';
import { DELETE, GET, PUT, Path, PathParam, PreProcessor, Security, ContextRequest } from 'typescript-rest';
import { Tags, Response } from 'typescript-rest-swagger';
import AbstractController from './abstract-controller';
import { User, UserRole } from '../entities/user-entity';
import { Ring } from '../entities/ring-entity';
import { CustomError } from '../utils/CustomError';
import { auth } from '../services/auth-service';
import { isCorrect } from '../services/user-crypto-service';

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

  @PUT
  @Path('/:id')
  @Response<{}>(200, 'User successfully updated')
  @Response<CustomError>(401, 'Unauthorised')
  public async updateUser(body: any, @PathParam('id') id: string): Promise<{} | void> {
    const { firstName, lastName } = body as User;

    const user: User = await this.getEntityById<User>(id);
    const newUser = Object.assign(user, { lastName, firstName });
    await this.validate(newUser);
    await this.users.save(newUser);
    return {};
  }

  @PUT
  @Path('/:id/update-password')
  @Response<{}>(200, 'Password successfully updated')
  @Response<CustomError>(401, 'Unauthorised')
  @Response<CustomError>(401, 'Invalid password')
  @Response<CustomError>(400, 'Both User old and new passwords are required')
  public async updatePassword(
    body: any,
    @PathParam('id') id: string,
    @ContextRequest req: Request,
  ): Promise<{} | void> {
    if (id !== req.user.id) {
      throw new CustomError('Unauthorized', 401);
    }
    const { password, newPassword } = body;
    // todo check that password corresponds some requirements
    if (!password || !newPassword) {
      throw new CustomError('Both User old and new passwords are required', 400);
    }
    const user: User = await this.getEntityById<User>(id);
    if (!(await isCorrect(password, user.salt, user.hash))) {
      throw new CustomError('Invalid password', 401);
    }

    await user.setPassword(password);
    await this.users.save(user);
    return {};
  }

  @PUT
  @Path('/:id/update-role')
  @PreProcessor(auth.role(UserRole.Admin))
  @Response<{}>(200, 'Role successfully updated.')
  @Response<CustomError>(400, 'Role is required')
  public async updateRole(body: any, @PathParam('id') id: string): Promise<{} | void> {
    const { role } = body;
    if (!role) {
      throw new CustomError('Role is required', 400);
    }
    const user: User = await this.getEntityById<User>(id);

    user.role = role;
    await this.users.save(user);
    return {};
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
}
