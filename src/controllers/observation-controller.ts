import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { UUID_LENGTH } from '../consts/controllers';
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

  private checkId = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const { id }: { id: string } = req.params;
    try {
      if (id.length !== UUID_LENGTH) {
        throw new Error(`Provided Observation identificator (${id}) is incorrect`);
      }

      const observation = await this.observations.findOne(id);

      if (!observation) {
        throw new Error(`Observation with ${id} not exists`);
      }
      Object.assign(req, { observation });
      next();
    } catch (e) {
      next(e);
    }
  };
}
