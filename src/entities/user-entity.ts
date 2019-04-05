import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { getSaltAndHash } from '../services/user-crypto-service';
import { RingByRecovery } from './ring-by-recovery-entity';
import { RingBy } from './ring-by-entity';
import { BasaRing } from './basa-ring-entity';

export interface NewUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export enum UserRole {
  Observer = 'observer',
  Ringer = 'ringer',
  Scientist = 'scientist',
  Moderator = 'moderator',
  Admin = 'admin',
}

@Entity()
export class User {
  // eslint-disable-next-line no-useless-constructor,no-empty-function
  protected constructor() {}

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  public email: string;

  @Column()
  public hash: string;

  @Column()
  public salt: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Observer,
  })
  public role: UserRole;

  @Column('varchar', { length: 64, nullable: true, default: null })
  public firstName: string | null;

  @Column('varchar', { length: 64, nullable: true, default: null })
  public lastName: string | null;

  @OneToMany(() => RingBy, m => m.ringerInformation)
  public ringBy: RingBy[];

  @OneToMany(() => RingByRecovery, m => m.finder)
  public ringByRecovery: RingByRecovery[];

  @OneToMany(() => BasaRing, m => m.ringer)
  public basaRing: BasaRing[];

  public static async create(values: NewUser): Promise<User> {
    const copyValues = Object.assign({}, values);
    const { salt, hash } = await getSaltAndHash(values.password);
    delete copyValues.password;
    return Object.assign(new User(), copyValues, { hash, salt });
  }
}
