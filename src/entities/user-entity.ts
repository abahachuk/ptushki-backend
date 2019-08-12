import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsEmail, MinLength, MaxLength, IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { getSaltAndHash } from '../services/user-crypto-service';
import { Observation } from './observation-entity';
import { Ring } from './ring-entity';
import { BasaRing } from './basa-ring-entity';

export enum UserRole {
  Observer = 'observer',
  Ringer = 'ringer',
  Scientist = 'scientist',
  Moderator = 'moderator',
  Admin = 'admin',
}

export class NewUser {
  @ApiModelProperty({ minLength: 1, maxLength: 64, uniqueItems: true })
  @IsEmail()
  @MaxLength(64)
  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  public email: string;

  @ApiModelPropertyOptional({ minLength: 1, maxLength: 64, nullable: true, default: null })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Column('varchar', { length: 64, nullable: true, default: null })
  public firstName?: string;

  @ApiModelPropertyOptional({ minLength: 1, maxLength: 64, nullable: true, default: null })
  @IsOptional()
  @MinLength(1)
  @MaxLength(64)
  @Column('varchar', { length: 64, nullable: true, default: null })
  public lastName?: string;
}

export class CreateUserDto extends NewUser {
  @ApiModelProperty()
  public password: string;
}

export class UserInfo extends NewUser {
  @ApiModelProperty()
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiModelProperty()
  @IsEnum(UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Observer,
  })
  public role: UserRole;
}

@Entity()
export class User extends UserInfo {
  // eslint-disable-next-line no-useless-constructor,no-empty-function
  protected constructor() {
    super();
  }

  @Column()
  public hash: string;

  @Column()
  public salt: string;

  @OneToMany(() => Ring, m => m.ringerInformation)
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

  public sanitizeUser() {
    return Object.assign(
      {},
      {
        id: this.id,
        email: this.email,
        role: this.role,
        firstName: this.firstName,
        lastName: this.lastName,
      },
    );
  }
}
