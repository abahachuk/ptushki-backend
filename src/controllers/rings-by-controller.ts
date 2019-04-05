import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { RingBy } from '../entities/ring-by-entity';

const UUID_LENGTH = config.get('UUID_LENGTH');

export default class RingsByController extends AbstractController {
  private router: Router;

  private rings: Repository<RingBy>;

  public init(): Router {
    this.router = Router();
    this.rings = getRepository(RingBy);

    this.router.get('/', this.findRings);
    this.router.param('id', this.checkId);
    this.router.get('/:id', this.findOneRing);
    this.router.delete('/:id', this.removeRing);
    this.router.post('/', this.addRing);

    return this.router;
  }

  private checkId = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const { id }: { id: string } = req.params;
    try {
      if (id.length !== UUID_LENGTH) {
        throw new Error(`Provided ring identifier (${id}) is incorrect`);
      }
      const user = await this.rings.findOne(id);
      if (!user) {
        throw new Error(`Ring with ${id} not exists`);
      }
      Object.assign(req, { user });
      next();
    } catch (e) {
      next(e);
    }
  };

  private findRings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rings = await this.rings.find();
      res.json(rings);
    } catch (e) {
      next(e);
    }
  };

  private findOneRing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const ring = await this.rings.findOne(id);
    try {
      res.json(ring);
    } catch (e) {
      next(e);
    }
  };

  private removeRing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
      await this.rings.remove(id);
      res.json({ id: req.params.id, removed: true });
    } catch (e) {
      next(e);
    }
  };

  private addRing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data = req.body;
    try {
      const result = await this.rings.save(data);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };
}
