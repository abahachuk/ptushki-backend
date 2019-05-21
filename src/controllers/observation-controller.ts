import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { Observation } from '../entities/observation-entity';
import { parseQueryParams, ObservationQuery } from '../services/observation-service';

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
    this.router.param('id', this.checkId);

    this.router.get('/', this.findObservations);

    this.router.post('/', this.addObservation);
    this.router.get('/:id', this.findObservation);
    this.router.put('/:id', this.editObservation);
    this.router.delete('/:id', this.removeObservation);

    return this.router;
  }

  private findObservations = async (req: RequestWithPageParams, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = parseQueryParams(req.query);
      const observationsPromise = this.observations.find(params);
      const [observations, count] = await Promise.all([observationsPromise, this.observations.count()]);
      res.json({
        content: observations,
        // aggregations: getAggregations(),
        pageNumber: params.number,
        pageSize: params.size,
        totalElements: count,
      });
    } catch (e) {
      next(e);
    }
  };

  private addObservation = async (req: Request, res: Response, next: NextFunction) => {
    const rawObservation = req.body;
    if (!req.user) res.status(401).send();

    try {
      const newObservation = await Observation.create({ ...rawObservation, finder: req.user.id });
      await this.validate(newObservation);
      const result = await this.observations.save(newObservation);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  private findObservation = async (req: RequestWithObservation, res: Response, next: NextFunction) => {
    const { observation }: { observation: Observation } = req;
    try {
      res.json(observation);
    } catch (e) {
      next(e);
    }
  };

  private editObservation = async (req: RequestWithObservation, res: Response, next: NextFunction) => {
    const { observation }: { observation: Observation } = req;
    const rawObservation = req.body;
    try {
      const updatedObservation = await this.observations.merge(observation, rawObservation);
      await this.validate(rawObservation);
      const result = await this.observations.save(updatedObservation);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  private removeObservation = async (req: RequestWithObservation, res: Response, next: NextFunction): Promise<void> => {
    const { observation }: { observation: Observation } = req;
    try {
      const result = await this.observations.remove(observation);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };
}
