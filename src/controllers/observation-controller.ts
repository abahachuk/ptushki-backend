import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { Observation } from '../entities/observation-entity';
// import { auth } from '../services/auth-service';

// const DEFAULT_QUERY = '*';
const DEFAULT_PAGE_NUMBER = '0';
const DEFAULT_PAGE_SIZE = '5';

interface RequestWithObservation extends Request {
  observation: Observation;
}

interface RequestWithPageParams extends Request {
  query: {
    search: string;
    pageNumber: string;
    pageSize: string;
  };
}

export default class ObservationController extends AbstractController {
  private router: Router;

  private observations: Repository<Observation>;

  public init(): Router {
    this.router = Router();
    this.observations = getRepository(Observation);
    this.setMainEntity(this.observations, 'observation');

    this.router.get('/', this.findObservations);
    this.router.post('/', this.addObservation);

    this.router.param('id', this.checkId);
    this.router.get('/:id', this.findOne);
    this.router.delete('/:id', this.remove);

    return this.router;
  }

  private remove = async (req: RequestWithObservation, res: Response, next: NextFunction): Promise<void> => {
    const { observation }: { observation: Observation } = req;
    try {
      await this.observations.remove(observation);
      res.json({ id: req.params.id, removed: true });
    } catch (e) {
      next(e);
    }
  };

  private findObservations = async (req: RequestWithPageParams, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        // search = DEFAULT_QUERY,
        pageNumber = DEFAULT_PAGE_NUMBER,
        pageSize = DEFAULT_PAGE_SIZE,
      } = req.query;

      const number = Number.parseInt(pageNumber, 10);
      const size = Number.parseInt(pageSize, 10);

      const observationsPromise = this.observations.find({
        skip: number * size,
        take: size,
      });
      const [observations, count] = await Promise.all([observationsPromise, this.observations.count()]);
      res.json({
        content: observations,
        pageNumber: number,
        pageSize: size,
        totalElements: count,
      });
    } catch (e) {
      next(e);
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
}
