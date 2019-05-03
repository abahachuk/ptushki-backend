import { NextFunction, Request, Response, Router } from 'express';
import { getRepository, Repository } from 'typeorm';
import AbstractController from './abstract-controller';
import { Ring } from '../entities/ring-entity';

interface RequestWithRing extends Request {
  ring: Ring;
}

export default class RingsByController extends AbstractController {
  private router: Router;

  private rings: Repository<Ring>;

  public init(): Router {
    this.router = Router();
    this.rings = getRepository(Ring);
    this.setMainEntity(this.rings, 'ring');

    this.router.get('/', this.findRings);
    this.router.param('id', this.checkId);
    this.router.get('/:id', this.findOneRing);
    this.router.delete('/:id', this.removeRing);
    this.router.post('/', this.addRing);

    return this.router;
  }

  private findRings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rings = await this.rings.find();
      res.json(rings);
    } catch (e) {
      next(e);
    }
  };

  private findOneRing = async (req: RequestWithRing, res: Response, next: NextFunction): Promise<void> => {
    const { ring }: { ring: Ring } = req;
    try {
      res.json(ring);
    } catch (e) {
      next(e);
    }
  };

  private removeRing = async (req: RequestWithRing, res: Response, next: NextFunction): Promise<void> => {
    const { ring }: { ring: Ring } = req;
    try {
      await this.rings.remove(ring);
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
