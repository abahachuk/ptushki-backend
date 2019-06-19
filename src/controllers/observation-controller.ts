import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { Observation } from '../entities/observation-entity';
import Exporter from '../services/export';
import Importer from '../services/import';
import { Ring } from '../entities/ring-entity';

import {
  parsePageParams,
  ObservationQuery,
  getAggregations,
  parseWhereParams,
  Locale,
  filterFieldByLocale,
} from '../services/observation-service';

interface RequestWithObservation extends Request {
  observation: Observation;
}

interface RequestWithPageParams extends Request {
  query: ObservationQuery;
}

export default class ObservationController extends AbstractController {
  private router: Router = Router();

  private observations: Repository<Observation>;

  private exporter: Exporter;

  private importer: Importer;

  private rings: Repository<Ring>;

  public init(): Router {
    this.observations = getRepository(Observation);
    this.rings = getRepository(Ring);
    this.setMainEntity(this.observations, 'observation');
    this.exporter = new Exporter();
    this.importer = new Importer();

    this.router.param('id', this.checkId);
    this.router.get('/', this.getObservations);
    this.router.get('/aggregations', this.getAggregations);
    this.router.post('/', this.addObservation);
    this.router.post('/export/:type', this.exporter.handle('observations'));
    this.router.post('/import/:type', this.importer.handle('observations'));
    this.router.get('/:id', this.findObservation);
    this.router.post('/:id/export/:type', this.exporter.handle('observations'));
    this.router.put('/:id', this.editObservation);
    this.router.delete('/:id', this.removeObservation);
    return this.router;
  }

  private getObservations = async (req: RequestWithPageParams, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lang = 'desc_eng' }: { lang: Locale } = req.query;
      const paramsSearch = parsePageParams(req.query);
      const paramsAggregation = parseWhereParams(req.query, req.user);
      const observations = await this.observations.findAndCount(Object.assign(paramsSearch, paramsAggregation));

      const content = observations[0].map(obs => {
        // sanitaze user's data
        const finder = Object.assign({}, obs.finder.sanitizeUser(), { id: obs.finder.id });
        // transform 'observation'
        const observation = Object.entries(obs)
          // clear 'filter' field
          .filter(([ObservationField]) => ObservationField !== 'ring')
          // map 'lang' param according 'Locale'
          .map(([ObservationKey, ObservationValue]) => {
            if (typeof ObservationValue === 'object' && ObservationValue !== null) {
              const value = Object.entries(ObservationValue)
                .filter(([subfield]) => filterFieldByLocale(subfield as Locale, lang))
                .map(([subfield, subValue]) => (subfield === lang ? ['desc', subValue] : ([subfield, subValue] as any)))
                .reduce((acc, [subfield, subValue]) => Object.assign(acc, { [subfield]: subValue }), {});
              return [ObservationKey, value];
            }
            return [ObservationKey, ObservationValue];
          })
          .reduce(
            (acc, [ObservationField, ObservationValue]) => Object.assign(acc, { [ObservationField]: ObservationValue }),
            {},
          );
        return Object.assign({}, observation, { finder }, { ring: obs.ring.id });
      });

      res.json({
        content,
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
    const rawObservation = req.body;
    try {
      let { ring } = rawObservation;
      if (!ring) {
        ({ id: ring = null } =
          (await this.rings.findOne({ identificationNumber: rawObservation.ringMentioned })) || {});
      }
      const newObservation = await Observation.create({ ...rawObservation, ring, finder: req.user.id });
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
      let { ring } = rawObservation;
      if (!ring || rawObservation.ringMentioned !== observation.ringMentioned) {
        ({ id: ring = null } =
          (await this.rings.findOne({ identificationNumber: rawObservation.ringMentioned })) || {});
      }
      await this.validate(Object.assign(rawObservation, { ring }), observation);
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
