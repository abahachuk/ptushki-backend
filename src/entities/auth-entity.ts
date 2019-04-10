import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class RefreshToken {
  // eslint-disable-next-line no-useless-constructor,no-empty-function
  public constructor(token: string) {
    this.token = token;
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar' })
  public token: string;
}
