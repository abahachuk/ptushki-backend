import { Request } from 'express';
import { getRepository, Repository } from 'typeorm';
import { DELETE, GET, PUT, Path, PathParam, PreProcessor, Security, ContextRequest } from 'typescript-rest';
import { Tags, Response } from 'typescript-rest-swagger';
import AbstractController from './abstract-controller';
import {
  User,
  UserRole,
  UpdateUserDto,
  UpdateUserEmailDto,
  UpdateUserRoleDto,
  UpdateUserPasswordDto,
} from '../entities/user-entity';
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

  /**
   * Get all available users
   */

  @GET
  @Path('/')
  @Response<User[]>(200, 'List of all users.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async find(): Promise<User[]> {
    return this.users.find();
  }

  /**
   * Get user by id
   * @param {string} id Id of requested user
   */

  @GET
  @Path('/:id')
  @Response<User>(200, 'User with passed id.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async findOne(@PathParam('id') id: string): Promise<User> {
    return this.getEntityById<User>(id);
  }

  /**
   * Update user by id
   * @param {UpdateUserDto} body Set of user's properties which can be updated
   * @param {string} id Id of updated user
   */

  @PUT
  @Path('/:id')
  @Response<void>(204, 'User successfully updated')
  @Response<CustomError>(401, 'Unauthorised')
  public async updateUser(
    body: UpdateUserDto,
    @PathParam('id') id: string,
    @ContextRequest req: Request & { user: User },
  ): Promise<void> {
    if (id !== req.user.id) {
      throw new CustomError('Unauthorized', 401);
    }
    const { firstName, lastName } = body;

    const user: User = await this.getEntityById<User>(id);
    const newUser = Object.assign(user, { lastName, firstName });
    await this.validate(newUser);
    await this.users.save(newUser);
  }

  /**
   * Update user password by id
   * @param {UpdateUserPasswordDto} body Both old and new passwords are required
   * @param {string} id Id of updated user
   */

  @PUT
  @Path('/:id/update-password')
  @Response<void>(204, 'Password successfully updated')
  @Response<CustomError>(401, 'Unauthorised')
  @Response<CustomError>(401, 'Invalid password')
  @Response<CustomError>(400, 'Both User old and new passwords are required')
  public async updatePassword(
    body: UpdateUserPasswordDto,
    @PathParam('id') id: string,
    @ContextRequest req: Request & { user: User },
  ): Promise<void> {
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
  }

  /**
   * Update user email by id
   * @param {UpdateUserEmailDto} body Required new email and current password
   * @param {string} id Id of updated user
   */

  @PUT
  @Path('/:id/update-email')
  @Response<void>(204, 'Email successfully updated')
  @Response<CustomError>(401, 'Unauthorised')
  @Response<CustomError>(401, 'Invalid password')
  @Response<CustomError>(400, 'Both User password and new email are required')
  public async updateEmail(
    body: UpdateUserEmailDto,
    @PathParam('id') id: string,
    @ContextRequest req: Request & { user: User },
  ): Promise<void> {
    if (id !== req.user.id) {
      throw new CustomError('Unauthorized', 401);
    }
    const { password, newEmail } = body;
    // todo check that password corresponds some requirements
    if (!newEmail && !password) {
      throw new CustomError('Both User password and new email are required', 400);
    }
    const user: User = await this.getEntityById<User>(id);
    if (!(await isCorrect(password, user.salt, user.hash))) {
      throw new CustomError('Invalid password', 401);
    }

    user.email = newEmail;
    await this.validate(user);
    await this.users.save(user);
  }

  /**
   * Update user role by id
   * @param {UpdateUserRoleDto} body Required only valid role and correct authority
   * @param {string} id Id of updated user
   */

  @PUT
  @Path('/:id/update-role')
  @PreProcessor(auth.role(UserRole.Admin))
  @Response<void>(204, 'Role successfully updated.')
  @Response<CustomError>(400, 'Role is required')
  @Response<CustomError>(400, 'Provided role is unsupported')
  public async updateRole(body: UpdateUserRoleDto, @PathParam('id') id: string): Promise<void> {
    const { role } = body;
    if (!role) {
      throw new CustomError('Role is required', 400);
    }
    // @ts-ignore
    if (!UserRole[role]) {
      throw new CustomError('Provided role is unsupported', 400);
    }
    const user: User = await this.getEntityById<User>(id);

    user.role = role;
    await this.users.save(user);
  }

  /**
   * Delete user by id
   * @param {string} id Id of deleted user
   */

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
