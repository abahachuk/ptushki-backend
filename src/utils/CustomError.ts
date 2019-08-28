// TODO: create specific errors to avoid generic
export class CustomError {
  public message: string;

  public status: number;

  public constructor(message: string, status: number) {
    this.message = message;
    this.status = status;
  }
}
