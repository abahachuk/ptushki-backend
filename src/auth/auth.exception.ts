export enum AuthExceptionStatus {
  TOKEN_REQUIRED = 0,
  TOKEN_NOT_FOUND = 1,
  TOKEN_EXPIRED = 2,
  TOKEN_INVALID = 3,
  USER_NOT_FOUND = 4,
}

export class AuthException extends Error {
  public status: AuthExceptionStatus;

  public message: string;

  public constructor(message: string, status: AuthExceptionStatus) {
    super();
    this.message = message;
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
