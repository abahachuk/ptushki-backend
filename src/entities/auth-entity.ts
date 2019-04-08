import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user-entity';

@Entity()
export class RefreshToken {
  // eslint-disable-next-line no-useless-constructor,no-empty-function
  protected constructor(token: string, user: User) {
    this.token = token;
    this.user = user;
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar' })
  public token: string;

  @ManyToOne(() => User, (user: User) => user.tokens)
  public user: User;
}
