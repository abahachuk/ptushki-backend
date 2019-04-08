import { Request, Response, NextFunction } from 'express';
import { logger } from '../configs/logger';

export default (err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err) {
    try {
      logger.error(JSON.stringify(err));
    } catch {
      logger.error(err.message);
    }
    res.status(err.status || 500).json({ error: err.message });
  }
  next();
};
