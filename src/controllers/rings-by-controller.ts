import { getRepository, Repository } from 'typeorm';
import { DELETE, GET, Path, PathParam, POST, PreProcessor, Security } from 'typescript-rest';
import { Response, Tags } from 'typescript-rest-swagger';
import AbstractController from './abstract-controller';
import { Ring, RingDto } from '../entities/ring-entity';
import { CustomError } from '../utils/CustomError';
import { auth } from '../services/auth-service';
import { UserRole } from '../entities/user-entity';

@Path('rings-by')
@Tags('rings-by')
@Security()
export default class RingsByController extends AbstractController {
  private rings: Repository<Ring>;

  public constructor() {
    super();
    this.rings = getRepository(Ring);
    this.setMainEntity(this.rings);
  }

  @GET
  @Path('/')
  @Response<Ring[]>(200, 'List of all available rings.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async findRings(): Promise<Ring[]> {
    return this.rings.find();
  }

  @GET
  @Path('/:id')
  @Response<Ring>(200, 'Ring with passed id.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async findOneRing(@PathParam('id') id: string): Promise<Ring> {
    return this.getEntityById<Ring>(id);
  }

  @DELETE
  @Path('/:id')
  @Response<{ id: string; removed: boolean }>(200, 'Ring with passed id successfully deleted.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async removeRing(@PathParam('id') id: string): Promise<{ id: string; removed: boolean }> {
    const ring = await this.getEntityById<Ring>(id);
    await this.rings.remove(ring);
    return { removed: true, id };
  }

  @POST
  @Path('/')
  @PreProcessor(auth.role(UserRole.Ringer))
  @Response<Ring>(200, 'Ring successfully created.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async addRing(rawRing: RingDto): Promise<void> {
    await this.validate(rawRing);
    // @ts-ignore FIXME we need create method for Ring
    return this.rings.save(rawRing);
  }
}
