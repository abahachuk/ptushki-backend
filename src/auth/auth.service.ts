import { Injectable } from '@nestjs/common';
import UsersService from '../users/users.service';
import { isCorrect } from '../services/user-crypto-service';
import { CreateUserDto, User, UserInfo } from '../entities/user-entity';
import { addAudit } from '../services/audit-service';
import { SuccessAuthDto } from './auth.dto';
import { TokensPairDto, TokensService } from './tokens.service';
import { AuthException, AuthExceptionStatus } from './auth.exception';

@Injectable()
export class AuthService {
  private readonly usersService: UsersService;

  private readonly tokensService: TokensService;

  public constructor(usersService: UsersService, tokensService: TokensService) {
    this.usersService = usersService;
    this.tokensService = tokensService;
  }

  private getSuccessPayload(user: User, tokens: TokensPairDto) {
    return {
      user: user.sanitizeUser(),
      ...tokens,
    };
  }

  public async validateUser(email: string, password: string): Promise<UserInfo> {
    const user = (await this.usersService.findOne(email)) as User;
    const isPasswordCorrect = user ? await isCorrect(password, user.salt, user.hash) : false;
    if (!isPasswordCorrect) {
      throw new Error('Password invalid');
    }

    return user;
  }

  public async login(user: User): Promise<SuccessAuthDto> {
    const tokens = await this.tokensService.getTokens({ userId: user.id, userRole: user.role });
    return this.getSuccessPayload(user, tokens);
  }

  public async signUp(newUser: CreateUserDto): Promise<SuccessAuthDto> {
    const user = await this.usersService.create(newUser);
    await addAudit('registration', '', null, user.id);
    return this.login(user);
  }

  public async logout(refreshToken: string, closeAllSessions: boolean) {
    const { userId } = await this.tokensService.deactivateToken(refreshToken, closeAllSessions);
    await addAudit('logout', '', null, userId);
    return { ok: true };
  }

  public async refresh(refreshToken: string) {
    const { userId } = await this.tokensService.deactivateToken(refreshToken);
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new AuthException('Non-existent user cannot be authorized', AuthExceptionStatus.USER_NOT_FOUND);
    }
    return this.tokensService.getTokens({ userId: user.id, userRole: user.role });
  }
}
