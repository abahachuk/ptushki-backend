import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { AuthException, AuthExceptionStatus } from './auth.exception';

const STATUS_MAP = {
  [AuthExceptionStatus.TOKEN_REQUIRED]: 400,
  [AuthExceptionStatus.TOKEN_NOT_FOUND]: 401,
  [AuthExceptionStatus.TOKEN_EXPIRED]: 401,
  [AuthExceptionStatus.TOKEN_INVALID]: 401,
  [AuthExceptionStatus.USER_NOT_FOUND]: 401,
};

@Catch(AuthException)
export class AuthExceptionFilter implements ExceptionFilter {
  public catch(exception: AuthException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = STATUS_MAP[exception.status] || 500;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
