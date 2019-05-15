import { NextFunction, Request, Response, Router } from 'express';
// import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';

export default class SeedsController extends AbstractController {
  private router: Router;

  public init(): Router {
    this.router = Router();

    this.router.get('/', this.getSeeds);

    return this.router;
  }

  private getSeeds = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({});
    } catch (e) {
      next(e);
    }
  };
}
