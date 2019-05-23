import { NextFunction, Request, Response, Router } from 'express';
import { getCustomRepository, Repository } from 'typeorm';

import AbstractController from './abstract-controller';
import { cachedEURINGCodes } from '../entities/euring-codes/cached-entities-fabric';
import { CachedRepository } from '../entities/cached-repository';

export default class SeedsController extends AbstractController {
  private router: Router;

  public cached: Repository<any>[];

  public init(): Router {
    this.router = Router();
    this.cached = Object.keys(cachedEURINGCodes).map((entityName: string) =>
      getCustomRepository(cachedEURINGCodes[entityName]),
    );

    this.router.get('/', this.getSeeds);

    return this.router;
  }

  private getSeeds = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ln } = req.query;
      const result = (await Promise.all(
        this.cached.map(async (repository: CachedRepository<any>) => ({
          records: await repository.findByLang(ln),
          tableName: repository.tableName,
        })),
      )).reduce((acc: { [index: string]: any[] }, { records, tableName }) => {
        acc[tableName] = records;
        return acc;
      }, {});
      res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  };
}
