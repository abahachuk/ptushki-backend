import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiImplicitBody,
  ApiUnauthorizedResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { CreateUserDto, User } from '../entities/user-entity';
import { AuthService } from './auth.service';
import { LogoutReqDto, RefreshReqDto, SuccessAuthDto } from './auth.dto';
import { TokensPairDto } from './tokens.service';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('auth')
@ApiUseTags('auth')
export class AuthController {
  private readonly authService: AuthService;

  public constructor(authService: AuthService) {
    this.authService = authService;
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiImplicitBody({ type: CreateUserDto, name: 'User credentials' })
  @ApiCreatedResponse({ description: 'Successfully logged in.', type: SuccessAuthDto })
  @ApiUnauthorizedResponse({ description: 'Authentication failed.' })
  public async login(@Req() { user }: RequestWithUser) {
    return this.authService.login(user);
  }

  @Post('signup')
  @ApiCreatedResponse({ description: 'Successfully signed up.', type: SuccessAuthDto })
  @ApiBadRequestResponse({ description: 'Email already exist' })
  public async signUp(@Body() user: CreateUserDto) {
    return this.authService.signUp(user);
  }

  @Post('logout')
  @ApiCreatedResponse({ description: 'Successfully logged out.' })
  @ApiBadRequestResponse({ description: 'Token not provided' })
  @ApiUnauthorizedResponse({ description: 'Token invalid or user not exists' })
  public async logout(@Body() params: LogoutReqDto) {
    const { refreshToken, closeAllSessions = false } = params;
    return this.authService.logout(refreshToken, closeAllSessions);
  }

  @Post('refresh')
  @ApiCreatedResponse({ description: 'Successfully refreshed.', type: TokensPairDto })
  @ApiBadRequestResponse({ description: 'Token not provided' })
  @ApiUnauthorizedResponse({ description: 'Token invalid or user not exists' })
  public async refresh(@Body() params: RefreshReqDto) {
    return this.authService.refresh(params.refreshToken);
  }
}
