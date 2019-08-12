export enum DataBaseExceptionStatus {
  UNIQUE_CONSTRAINT = 0,
}

export class DatabaseException extends Error {
  public status: DataBaseExceptionStatus;

  public message: string;

  public constructor(message: string, status: DataBaseExceptionStatus) {
    super();
    this.message = message;
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
