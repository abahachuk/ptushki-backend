import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { RingByRecovery as Observation } from '../entities/ring-by-recovery-entity';

interface RequestWithObservation extends Request {
  observation: Observation;
}

export default class ObservationController extends AbstractController {
  private router: Router;

  private observations: Repository<Observation>;

  public init(): Router {
    this.router = Router();
    this.observations = getRepository(Observation);
    this.setMainEntity(this.observations, 'observation');

    this.router.get('/', this.find);
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

  private find = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const observations = await this.observations.find();

      res.json(observations);
    } catch (e) {
      next(e);
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
