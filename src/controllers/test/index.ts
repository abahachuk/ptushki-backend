import { Request, Response } from 'express';

export const showDefaultMessage = (req: Request, res: Response) => {
  res.send('Hello world!');
};
