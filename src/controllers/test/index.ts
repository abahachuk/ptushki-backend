import { Request, Response } from 'express';

export const showDefaultMessage = (req: Request, res: Response) => {
  const { hostname } = req;
  res.send(`Hello from ${hostname}!`);
};
