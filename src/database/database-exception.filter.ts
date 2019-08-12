import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { DatabaseException, DataBaseExceptionStatus } from './database.exception';

const STATUS_MAP = {
  [DataBaseExceptionStatus.UNIQUE_CONSTRAINT]: 400,
};

@Catch(DatabaseException)
export class DatabaseExceptionFilter implements ExceptionFilter {
  public catch(exception: DatabaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = STATUS_MAP[exception.status] || 500;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
