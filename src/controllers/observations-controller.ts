import { Request } from 'express';
import { getRepository, Repository } from 'typeorm';
import { pipe } from 'ramda';
import {
  ContextRequest,
  DELETE,
  FilesParam,
  GET,
  Path,
  PathParam,
  POST,
  PreProcessor,
  PUT,
  QueryParam,
  Return,
  Security,
} from 'typescript-rest';
import { Tags, Response, Produces } from 'typescript-rest-swagger';

import AbstractController from './abstract-controller';
import {
  Observation,
  ObservationBaseDto,
  ObservationDto,
  RawObservationDto,
  Verified,
} from '../entities/observation-entity';
import { Ring } from '../entities/ring-entity';
import Mark from '../entities/submodels/Mark';
import Exporter from '../services/export';
import Importer from '../services/import';

import { ObservationQuery, parseWhereParams, sanitizeUser } from '../services/observation-service';
import { CustomError } from '../utils/CustomError';
import { auth } from '../services/auth-service';
import { UserRole } from '../entities/user-entity';
import { ExporterType } from '../services/export/AbstractExporter';
import { ImporterType } from '../services/import/AbstractImporter';
import { ImportWorksheetXLSDto } from '../services/import/XLSBaseImporter';
import { parsePageParams, SortingDirection } from '../services/page-service';

interface RequestWithPageParams extends Request {
  query: ObservationQuery;
}

interface ObservationsListResponse {
  content: ObservationDto[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
}

type ObservationKeyUnion = keyof Observation;
interface AggregationsMap {
  [key: string]: { value: any; count: number }[];
}

@Path('observations')
@Tags('observations')
@Security()
export default class ObservationsController extends AbstractController {
  private readonly observations: Repository<Observation>;

  private readonly rings: Repository<Ring>;

  private exporter: Exporter;

  private importer: Importer;

  private aggregatedColumns: ObservationKeyUnion[] = ['speciesMentioned', 'verified', 'finder', 'ringMentioned'];

  public constructor() {
    super();
    this.observations = getRepository(Observation);
    this.rings = getRepository(Ring);
    this.setMainEntity(this.observations);
    this.exporter = new Exporter('observations');
    this.importer = new Importer('observations');
  }

  /**
   * Get all available observations.
   * @param pageNumber Page number, default value is set in config file
   * @param pageSize Page size, default value is set in config file
   * @param sortingDirection Sorting direction
   * @param sortingColumn Column to search, can be any of ObservationDto field name
   */
  @GET
  @Path('/')
  @Response<ObservationsListResponse>(200, 'List of all available observations.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async getObservations(
    @ContextRequest req: RequestWithPageParams,
    @QueryParam('pageNumber') pageNumber?: number,
    @QueryParam('pageSize') pageSize?: number,
    @QueryParam('sortingDirection') sortingDirection?: SortingDirection,
    @QueryParam('sortingColumn') sortingColumn?: string,
  ): Promise<ObservationsListResponse> {
    const { query, user } = req;

    const paramsSearch = parsePageParams<Observation>({ pageNumber, pageSize, sortingColumn, sortingDirection });
    const paramsAggregation = parseWhereParams(user, query);

    const [observations, totalElements] = await this.observations.findAndCount(
      Object.assign(paramsSearch, paramsAggregation),
    );

    const f = pipe((arg: [string, any]) => sanitizeUser(arg));

    const content = observations.map(observation =>
      Object.entries(observation)
        .map(f)
        .reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {}),
    ) as ObservationDto[];

    return {
      content,
      pageNumber: paramsSearch.pageNumber,
      pageSize: paramsSearch.pageSize,
      totalElements,
    };
  }

  // TODO: currently typescript-rest doesn't support [key in keyof smth] syntax
  /**
   * Get all available values for filtering observations.
   * Returns all existing values of observation fields.
   */
  @GET
  @Path('/aggregations')
  @Response<AggregationsMap>(200, 'All available values for filtering observations.')
  @Response<CustomError>(401, 'Unauthorised.')
  // eslint-disable-next-line consistent-return
  public async getAggregations(
    @ContextRequest req: Request,
    // @ts-ignore FIXME
  ): Promise<AggregationsMap> {
    const { query, user } = req;

    const paramsAggregation = parseWhereParams(user, query);
    const observations = await this.observations.find({ ...paramsAggregation });
    const aggregationMap: AggregationsMap = this.aggregatedColumns.reduce(
      (map, column) => Object.assign(map, { [column]: [] }),
      {},
    );

    return observations.reduce((aggregation, observation) => {
      this.aggregatedColumns.forEach(column => {
        const desired = aggregation[column].find(({ value, value: { id } }) => {
          if (typeof observation[column] === 'object' && observation[column] !== null && id) {
            return id === (observation[column] as Record<string, any>).id;
          }
          return value === observation[column];
        });

        if (desired) {
          desired.count += 1;
        } else {
          const f = pipe((arg: [string, any]) => sanitizeUser(arg));
          const [, value] = f([column, observation[column]]);
          // readme disable aggregation by untruly values:  at first null
          if (value !== null) {
            aggregation[column].push({ value, count: 1 });
          }
        }
      });
      return aggregation;
    }, aggregationMap);
  }

  private async connectObservationWithRing(
    ringMentioned: string | undefined,
    otherMarks: Mark[] | undefined,
  ): Promise<Ring | undefined> {
    let ringEntity = ringMentioned ? await this.rings.findOne({ identificationNumber: ringMentioned }) : undefined;
    if (ringEntity) return ringEntity;
    // TODO implement search by marks
    console.log(otherMarks);
    ringEntity = undefined;

    return ringEntity;
  }

  /**
   * Create new observation. This observation will be automatically assigned to the sender of this request.
   * The specified field `ringMentioned` will be searched by the table of rings,
   * next search will be made by bird's marks from specified `otherMarks` field.
   * If finally ring found, it will be assigned as link to the ring.
   * @param rawObservation Data for new observation.
   */

  @POST
  @Path('/')
  @Response<ObservationBaseDto>(200, 'New observation.')
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(422, 'Unprocessable entity.')
  // eslint-disable-next-line consistent-return
  public async addObservation(
    rawObservation: RawObservationDto,
    @ContextRequest req: Request,
  ): Promise<ObservationBaseDto> {
    const { ringMentioned, otherMarks } = rawObservation;
    if (Array.isArray(otherMarks)) {
      await Promise.all(otherMarks.map(m => this.validate(m, undefined, Mark)));
    }

    const ring = await this.connectObservationWithRing(ringMentioned, otherMarks);
    const newObservation = await Observation.create({
      ...rawObservation,
      ring: ring ? ring.id : null,
      finder: req.user.id,
    });
    await this.validate(newObservation);
    // @ts-ignore see https://github.com/typeorm/typeorm/issues/3490
    return this.observations.save(newObservation);
  }

  /**
   * Get observation by id.
   * @param id Id if requested observation.
   */
  @GET
  @Path('/:id')
  // TODO do we really want to return whole observation with user salt and hash?
  @Response<Observation>(200, 'Observation with passed id.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async findObservation(@PathParam('id') id: string): Promise<Observation> {
    return this.getEntityById<Observation>(id);
  }

  /**
   * Update observation by id, if the observation the ring number or bird's marks
   * (`ringMentioned` & `otherMarks` accordingly) have been changed, a search will
   * be made for the ring base and a link to the ring will be removed or updated or added if found.
   * @param rawObservation Data for new updating.
   * @param id Id of updated observation.
   */
  @PUT
  @Path('/:id')
  @Response<Observation>(200, 'Updated observation.')
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(422, 'Unprocessable entity.')
  public async editObservation(rawObservation: ObservationBaseDto, @PathParam('id') id: string): Promise<Observation> {
    // TODO: check user id and role
    const { ringMentioned, otherMarks } = rawObservation;
    const observation = await this.getEntityById<Observation>(id);
    let ring: Ring | null = observation.ring || null;
    let partial = {};
    if (Array.isArray(otherMarks)) {
      await Promise.all(otherMarks.map(m => this.validate(m, undefined, Mark)));
    }

    if (
      ringMentioned !== observation.ringMentioned ||
      JSON.stringify(otherMarks) !== JSON.stringify(observation.otherMarks)
    ) {
      ring = (await this.connectObservationWithRing(ringMentioned, otherMarks)) as Ring;
      partial = observation.reFillByRing(ring);
    }

    const newObservation = Object.assign(observation, rawObservation, partial, { ring });

    await this.validate(newObservation);
    // TODO protect from finder updating
    // @ts-ignore see https://github.com/typeorm/typeorm/issues/3490
    return this.observations.save(newObservation);
  }

  /**
   * Delete observation by id,
   * @param id Id of deleted observation.
   */
  @DELETE
  @Path('/:id')
  @Response<Observation>(200, 'Updated observation.')
  @Response<CustomError>(401, 'Unauthorised.')
  public async removeObservation(@PathParam('id') id: string): Promise<Observation> {
    const observation = await this.getEntityById<Observation>(id);
    return this.observations.remove(observation);
  }

  /**
   * Update verification status for observation.
   * @param payload Object with properties: id of updated observation and status as new verification status.
   */
  @POST
  @Path('/set-verification')
  @Response<{ ok: boolean }>(200, 'Updated observation.')
  @Response<CustomError>(400, 'Invalid data.')
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(403, 'Forbidden.')
  @PreProcessor(auth.role(UserRole.Moderator))
  public async setVerificationStatus(payload: { id: string; status: Verified }): Promise<{ ok: boolean }> {
    const { id, status } = payload;
    if (!id || !status) {
      throw new CustomError('Id and status are required', 400);
    }
    await this.observations.findOneOrFail(id);
    // TODO add validation on this step -- will require to distinguish current validation on two leveled requirements
    await this.observations.update(id, { verified: status });
    return { ok: true };
  }

  /**
   * Export observations with passed ids to xls.
   * @param exportedContent Object with data about observations to export.
   */
  @POST
  @Path('/export/xls')
  @Produces('application/xlsx')
  @PreProcessor(auth.role(UserRole.Ringer))
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(403, 'Forbidden.')
  public async exportXls(exportedContent: { ids: string[]; lang?: string }): Promise<Return.DownloadBinaryData> {
    const { ids, lang } = exportedContent;
    const buffer = await this.exporter.handle(ExporterType.xls, ids, lang);
    return new Return.DownloadBinaryData(buffer, 'application/xlsx', 'obs.xlsx');
  }

  /**
   * Get xls template for observations.
   * After that, the template should be filled with data with new observations
   * and imported by the same endpoint only using the POST method.
   */
  @GET
  @Path('/export/xls')
  @Produces('application/xlsx')
  @PreProcessor(auth.role(UserRole.Ringer))
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(403, 'Forbidden.')
  public async exportXlsTemplate(): Promise<Return.DownloadBinaryData> {
    const buffer = await this.exporter.handle(ExporterType.template);
    return new Return.DownloadBinaryData(buffer, 'application/xlsx', 'template-for-observations.xlsx');
  }

  /**
   * Export observations with passed ids to euring codes.
   * @param exportedContent Contains ids of observations to export.
   */
  @POST
  @Path('/export/euring')
  @Response<string[]>(200, 'Euring codes of selected observations.')
  @PreProcessor(auth.role(UserRole.Ringer))
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(403, 'Forbidden.')
  public async exportEuring(exportedContent: { ids: string[] }): Promise<string[]> {
    const { ids } = exportedContent;
    return this.exporter.handle(ExporterType.euring, ids);
  }

  /**
   * Export observations with passed id to xls.
   * @param exportedContent Object containing target language.
   * @param id Id of observation to export.
   */
  @POST
  @Path('/:id/export/xls')
  @Produces('application/xlsx')
  @PreProcessor(auth.role(UserRole.Ringer))
  @Response<Return.DownloadBinaryData>(200, 'Xls with observations.')
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(403, 'Forbidden.')
  public async exportXlsSingle(
    exportedContent: { lang?: string },
    @PathParam('id') id: string,
  ): Promise<Return.DownloadBinaryData> {
    const { lang } = exportedContent;
    const buffer = await this.exporter.handle(ExporterType.xls, [id], lang);
    return new Return.DownloadBinaryData(buffer, 'application/xlsx', 'obs_template.xlsx');
  }

  /**
   * Import xls file with observations. First each file is validated, and only then imported.
   * All observations will be assigned to the user making request.
   * @param files Files in xls format to import. (for a while is only used first file)
   */
  @POST
  @Path('/import/xls')
  @PreProcessor(auth.role(UserRole.Ringer))
  @Response<ImportWorksheetXLSDto>(200, 'Object of import result, with errors if needed.')
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(403, 'Forbidden.')
  public async importXls(@FilesParam('files') files: Express.Multer.File[]): Promise<ImportWorksheetXLSDto> {
    return this.importer.handle(ImporterType.xls, { sources: files });
  }

  /**
   * Import observations from EURING codes. All observations will be assigned to the user making request.
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
