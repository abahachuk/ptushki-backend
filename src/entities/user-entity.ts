import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  public static create(values: NewUser) {
    return Object.assign(new User(), values);
  }
}
