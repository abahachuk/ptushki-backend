import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ResetToken {
  // eslint-disable-next-line no-useless-constructor,no-empty-function
  public constructor(token: string, userId: string) {
    this.token = token;
    this.userId = userId;
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar' })
  public token: string;

  @Column({ type: 'varchar' })
  public userId: string;
}
