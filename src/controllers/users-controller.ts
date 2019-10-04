import { getRepository, Repository } from 'typeorm';
import { DELETE, GET, Path, PathParam, PreProcessor, Security } from 'typescript-rest';
import { Tags, Response } from 'typescript-rest-swagger';
import AbstractController from './abstract-controller';
import { User, UserRole } from '../entities/user-entity';
import { Ring } from '../entities/ring-entity';
import { CustomError } from '../utils/CustomError';
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
}
