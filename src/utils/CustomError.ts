export class CustomError<T = string> {
  public message: T;

  public status: number;

  public constructor(message: T, status: number) {
    this.message = message;
    this.status = status;
  }
}
