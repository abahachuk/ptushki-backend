import { Request, Response, NextFunction } from 'express';
import { logger } from '../configs/logger';

export default (err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
  next();
};
