import { IProcessor } from 'typeorm-fixtures-cli';
import { User, UserRole } from '../entities/user-entity';

/* eslint-disable class-methods-use-this */
export default class UserProcessor implements IProcessor<User> {
  public preProcess(_name: string, object: any): any {
    if (!object.role) {
      return { ...object, role: Math.random() > 0.5 ? UserRole.Observer : UserRole.Ringer };
    }
    return object;
  }

  public async postProcess(_name: string, user: { password: string } & User): Promise<void> {
    await user.setPassword(user.password as string);
  }
}
