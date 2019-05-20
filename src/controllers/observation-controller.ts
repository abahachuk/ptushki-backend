import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { Observation } from '../entities/observation-entity';
import { parseQueryParams, ObservationQuery, getAggregations, parseWhereParams } from '../services/observation-service';

interface RequestWithObservation extends Request {
  observation: Observation;
}

interface RequestWithPageParams extends Request {
  query: ObservationQuery;
}

export default class ObservationController extends AbstractController {
  private router: Router;

  private observations: Repository<Observation>;

  public init(): Router {
    this.router = Router();
    this.observations = getRepository(Observation);
    this.setMainEntity(this.observations, 'observation');

    this.router.get('/', this.findObservations);
    this.router.get('/aggregations', this.getAggregations);
    this.router.post('/', this.addObservation);
    this.router.param('id', this.checkId);
    this.router.get('/:id', this.findOne);
    this.router.delete('/:id', this.remove);

    return this.router;
  }

  private findObservations = async (req: RequestWithPageParams, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramsSearch = parseQueryParams(req.query);
      const paramsAggregation = parseWhereParams(req.query);

      // console.log(JSON.stringify(Object.assign({}, paramsSearch, paramsAggregation), null, 2));

      const observations = await this.observations.findAndCount(Object.assign(paramsSearch, paramsAggregation));

      res.json({
        content: observations[0],
        pageNumber: paramsSearch.number,
        pageSize: paramsSearch.size,
        totalElements: observations[1],
      });
    } catch (error) {
      next(error);
    }
  };

  private getAggregations = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const aggregations = await getAggregations(this.observations);
      res.json({ ...aggregations });
    } catch (error) {
      next(error);
    }
  };

  private addObservation = async (req: Request, res: Response, next: NextFunction) => {
    const newObservation = req.body;
    if (!req.user) {
      return res.status(401).send();
    }

    // validation of Observation fields should be somewhere here

    try {
      const observation = await Observation.create({ ...newObservation, finder: req.user.id });
      const result = await this.observations.save(observation);
      return res.json(result);
    } catch (e) {
      return next(e);
    }
  };

  private findOne = (req: RequestWithObservation, res: Response, next: NextFunction): void => {
    const { observation }: { observation: Observation } = req;
    try {
      res.json(observation);
    } catch (e) {
      next(e);
    }
  };

  private remove = async (req: RequestWithObservation, res: Response, next: NextFunction): Promise<void> => {
    const { observation }: { observation: Observation } = req;
    try {
      await this.observations.remove(observation);
      res.json({ id: req.params.id, removed: true });
    } catch (e) {
      next(e);
    }
  };
}
