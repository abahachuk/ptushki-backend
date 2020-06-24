import { getRepository, Repository } from 'typeorm';
import {
  DELETE,
  GET,
  Path,
  PathParam,
  POST,
  PreProcessor,
  Security,
  QueryParam,
  ContextRequest,
} from 'typescript-rest';
import { Response, Tags } from 'typescript-rest-swagger';
import { Request } from 'express';
import AbstractController from './abstract-controller';
import { Ring, RingDto } from '../entities/ring-entity';
import Exporter from '../services/export';
import Importer from '../services/import';
import { ExporterType } from '../services/export/AbstractExporter';
import { ImporterType } from '../services/import/AbstractImporter';
import { CustomError } from '../utils/CustomError';
import { auth } from '../services/auth-service';
import { UserRole } from '../entities/user-entity';
import { parsePageParams, SortingDirection } from '../services/page-service';

interface RingListResponse {
  content: RingDto[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
}

@Path('rings-by')
@Tags('rings-by')
@Security()
export default class RingsController extends AbstractController {
  private readonly rings: Repository<Ring>;

  private exporter: Exporter;

  private importer: Importer;

  public constructor() {
    super();
    this.rings = getRepository(Ring);
    this.setMainEntity(this.rings);
    this.exporter = new Exporter('rings-by');
    this.importer = new Importer('rings-by');
  }

  /**
   * Get all available rings.
   * @param {number} pageNumber Page number, default value is set in config file
   * @param {number} pageSize Page size, default value is set in config file
   * @param {SortingDirection} sortingDirection Sorting direction
   * @param {string} sortingColumn Column to search, can be any of ObservationDto field name
   */
  @GET
  @Path('/')
  @Response<RingListResponse>(200, 'List of all available rings.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async findRings(
    @QueryParam('pageNumber') pageNumber?: number,
    @QueryParam('pageSize') pageSize?: number,
    @QueryParam('sortingDirection') sortingDirection?: SortingDirection,
    @QueryParam('sortingColumn') sortingColumn?: string,
  ): Promise<RingListResponse> {
    const paramsSearch = parsePageParams<Ring>({ pageNumber, pageSize, sortingColumn, sortingDirection });
    const [rings, totalElements] = await this.rings.findAndCount(paramsSearch);
    return {
      content: rings,
      pageNumber: paramsSearch.pageNumber,
      pageSize: paramsSearch.pageSize,
      totalElements,
    };
  }

  @GET
  @Path('/aggregations')
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(501, 'Unimplemented.')
  public async getAggregations(): Promise<void> {
    throw new CustomError('This operation is not available yet', 501);
  }

  /**
   * Get ring by id,
   * @param {string} id Id if requested ring.
   */
  @GET
  @Path('/:id')
  @Response<Ring>(200, 'Ring with passed id.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async findOneRing(@PathParam('id') id: string): Promise<Ring> {
    return this.getEntityById<Ring>(id);
  }

  /**
   * Delete ring by id,
   * @param id Id of ring to delete.
   */
  @DELETE
  @Path('/:id')
  @Response<{ id: string; removed: boolean }>(200, 'Ring with passed id successfully deleted.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async removeRing(@PathParam('id') id: string): Promise<{ id: string; removed: boolean }> {
    const ring = await this.getEntityById<Ring>(id);
    await this.rings.remove(ring);
    return { removed: true, id };
  }

  /**
   * Export rings with passed ids to euring codes.
   * @param exportedContent Contains ids of rings to export.
   */
  @POST
  @Path('/export/euring')
  @Response<string[]>(200, 'Euring codes of selected rings.')
  @PreProcessor(auth.role(UserRole.Ringer))
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(403, 'Forbidden.')
  public async exportEuring(exportedContent: { ids: string[] }): Promise<string[]> {
    const { ids } = exportedContent;
    return this.exporter.handle(ExporterType.euring, ids);
  }

  /**
   * Create new ring.
   * @param {RingDto} rawRing Data for new ring.
   */
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

  /**
   * Import rings from EURING codes. All rings will be assigned to the user making request.
   * @param codes EURING codes to import.
   */
  @POST
  @Path('/import/euring')
  @PreProcessor(auth.role(UserRole.Ringer))
  @Response<{ ok: boolean }>(200, 'Successfully imported.')
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(403, 'Forbidden.')
  public async importEuring(@ContextRequest req: Request, codes: string[]): Promise<{ ok: boolean }> {
    await this.importer.handle(ImporterType.euring, { sources: codes, userId: req.user.id });
    return { ok: true };
  }
}
