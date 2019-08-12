import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiUseTags } from '@nestjs/swagger';
import UsersService from './users.service';
import { User } from '../entities/user-entity';

@Controller('users')
@ApiUseTags('users')
export default class UsersController {
  private readonly usersService: UsersService;

  public constructor(usersService: UsersService) {
    this.usersService = usersService;
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public async find(): Promise<User[]> {
    return this.usersService.find();
  }
}
