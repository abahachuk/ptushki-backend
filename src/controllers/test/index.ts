import { Request, Response } from 'express';

export const showDefaultMessage = (req: Request, res: Response): void => {
  res.send('Hello world!');
};
