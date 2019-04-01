import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { getSaltAndHash } from '../services/user-crypto-service';

export interface NewUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

@Entity()
export class User {
  // eslint-disable-next-line no-useless-constructor,no-empty-function
  protected constructor() {}

  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public email: string;

  @Column()
  public hash: string;

  @Column()
  public salt: string;

  @Column()
  public firstName: string;

  @Column()
  public lastName: string;

  public static async create(values: NewUser) {
    const copyValues = Object.assign({}, values);
    const { salt, hash } = await getSaltAndHash(values.password);
    delete copyValues.password;
    return Object.assign(new User(), copyValues, { hash, salt });
  }
}
