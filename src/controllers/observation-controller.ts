import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { Observation } from '../entities/observation-entity';
import { Species } from '../entities/euring-codes/species-entity';
import { Age } from '../entities/euring-codes/age-entity';
import { Circumstances } from '../entities/euring-codes/circumstances-entity';
import { parsePageParams, ObservationQuery, getAggregations, parseWhereParams } from '../services/observation-service';

interface RequestWithObservation extends Request {
  observation: Observation;
}

interface RequestWithPageParams extends Request {
  query: ObservationQuery;
}

export default class ObservationController extends AbstractController {
  private router: Router;

  private observations: Repository<Observation>;

  private species: Repository<Species>;

  private age: Repository<Age>;

  private circumstances: Repository<Circumstances>;

  public init(): Router {
    this.router = Router();
    this.observations = getRepository(Observation);
    this.species = getRepository(Species);
    this.age = getRepository(Age);
    this.circumstances = getRepository(Circumstances);

    this.setMainEntity(this.observations, 'observation');

    this.router.param('id', this.checkId);
    this.router.get('/', this.getObservations);
    this.router.get('/aggregations', this.getAggregations);
    this.router.get('/catalog', this.getCatalog);
    this.router.post('/', this.addObservation);
    this.router.get('/:id', this.findObservation);
    this.router.put('/:id', this.editObservation);
    this.router.delete('/:id', this.removeObservation);
    return this.router;
  }

  private getObservations = async (req: RequestWithPageParams, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramsSearch = parsePageParams(req.query);
      const paramsAggregation = parseWhereParams(req.query);
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

  private getCatalog = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const speciesPromise = this.species.find({ select: ['id', 'species', 'family', 'letterCode', 'desc_rus'] });
      const agePromise = this.age.find({ select: ['id', 'desc_rus'] });
      const circumstancesPromise = this.circumstances.find({ select: ['id', 'desc_rus'] });
      const [species, age, circumstances] = await Promise.all([speciesPromise, agePromise, circumstancesPromise]);
      res.json({ species, age, circumstances });
    } catch (error) {
      next(error);
    }
  };

  private addObservation = async (req: Request, res: Response, next: NextFunction) => {
    const rawObservation = req.body;
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
      await this.validate(rawObservation, observation);
      const updatedObservation = await this.observations.merge(observation, rawObservation);
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
