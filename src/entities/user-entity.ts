import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsEmail, MinLength, MaxLength, IsEnum, IsString, IsOptional } from 'class-validator';
import { getSaltAndHash } from '../services/user-crypto-service';
import { Observation } from './observation-entity';
import { Ring } from './ring-entity';
import { BasaRing } from './basa-ring-entity';

export interface WithCredentials {
  email: string;
  password: string;
}

export enum UserRole {
  Observer = 'observer',
  Ringer = 'ringer',
  Scientist = 'scientist',
  Moderator = 'moderator',
  Admin = 'admin',
}

export interface NewUser {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateUserDto extends NewUser, WithCredentials {}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserEmailDto {
  newEmail: string;
  password: string;
}

export interface UpdateUserPasswordDto {
  newPassword: string;
  password: string;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

export interface UserDto extends NewUser {
  id: string;
  role: UserRole;
}

export interface UserPlace {
  customName: string;
  geoName: string;
  latitude: number;
  longitude: number;
}

@Entity()
export class User implements UserDto {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @IsEnum(UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Observer,
  })
  public role: UserRole;

  @IsEmail()
  @MaxLength(64)
  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  public email: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Column('varchar', { length: 64, nullable: true, default: null })
  public firstName?: string;

  @IsOptional()
  @MinLength(1)
  @MaxLength(64)
  @Column('varchar', { length: 64, nullable: true, default: null })
  public lastName?: string;

  @IsOptional()
  @Column('jsonb', { nullable: true })
  public places?: UserPlace[];

  @Column()
  public hash: string;

  @Column()
  public salt: string;

  @OneToMany(() => Ring, m => m.ringer)
  public ring: Ring[];

  @OneToMany(() => Observation, m => m.finder)
  public observation: Observation[];

  @OneToMany(() => BasaRing, m => m.ringer)
  public basaRing: BasaRing[];

  public static async create(values: CreateUserDto): Promise<User> {
    const copyValues = Object.assign({}, values);
    const { salt, hash } = await getSaltAndHash(values.password);
    delete copyValues.password;
    return Object.assign(new User(), copyValues, { hash, salt });
  }

  public async setPassword(password: string): Promise<void> {
    Object.assign(this, await getSaltAndHash(password));
  }

  public static sanitizeUser(user: User) {
    return Object.assign(
      {},
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    );
  }
}
