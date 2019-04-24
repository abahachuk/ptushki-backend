import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { Observation } from '../entities/observation-entity';

interface RequestWithObservation extends Request {
  observation: Observation;
}

/**
 * @rootPath= /observations
 * @description= Observation operations
 */
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

  /**
   * @summary= remove observation
   * @method= delete
   * @path= /{id}
   * @response= { id: String, removed: Boolean }
   */
  private remove = async (req: RequestWithObservation, res: Response, next: NextFunction): Promise<void> => {
    const { observation }: { observation: Observation } = req;
    try {
      await this.observations.remove(observation);
      res.json({ id: req.params.id, removed: true });
    } catch (e) {
      next(e);
    }
  };

  /**
   * @summary= get observation
   * @method= get
   * @path= /
   * @response= { "items": { "$ref": "#/definitions/RingByRecovery" }, "type": "array" }
   */
  private find = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const observations = await this.observations.find();

      res.json(observations);
    } catch (e) {
      next(e);
    }
  };

  /**
   * @summary= get observation by id
   * @method= get
   * @path= /{id}
   * @response= #/definitions/RingByRecovery
   */
  private findOne = (req: RequestWithObservation, res: Response, next: NextFunction): void => {
    const { observation }: { observation: Observation } = req;
    try {
      res.json(observation);
    } catch (e) {
      next(e);
    }
  };
}
