import { NextFunction, Request } from 'express';
import { getRepository, Repository } from 'typeorm';
import { pipe } from 'ramda';
import {
  ContextNext,
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
import AbstractController from './abstract-controller';

import {
  Observation,
  ObservationBaseDto,
  ObservationDto,
  RawObservationDto,
  Verified,
} from '../entities/observation-entity';
import Exporter from '../services/export';
import Importer from '../services/import';
import { Ring } from '../entities/ring-entity';

import {
  filterFieldByLocale,
  getAggregations,
  Locale,
  LocaleOrigin,
  ObservationQuery,
  parsePageParams,
  parseWhereParams,
  SortingDirection,
  sanitizeUser,
} from '../services/observation-service';
import { CustomError } from '../utils/CustomError';
import { auth } from '../services/auth-service';
import { UserRole } from '../entities/user-entity';
import { ExporterType } from '../services/export/AbstractExporter';
import { StringImporterType, XlsImporterType } from '../services/import/AbstractImporter';
import { DataCheckDto } from '../services/import/excel/helper';

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
export default class ObservationController extends AbstractController {
  private observations: Repository<Observation>;

  private exporter: Exporter;

  private importer: Importer;

  private rings: Repository<Ring>;

  private requiredColumns: ObservationKeyUnion[] = ['speciesMentioned', 'verified', 'finder', 'ringMentioned'];

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
   * @param {string} lang Language
   * @param {number} pageNumber Page number, default value is set in config file
   * @param {number} pageSize Page size, default value is set in config file
   * @param {SortingDirection} sortingDirection Sorting direction
   * @param {string} sortingColumn Column to search, can be any of ObservationDto field name
   */
  @GET
  @Path('/')
  @Response<ObservationsListResponse>(200, 'List of all available observations.')
  @Response<CustomError>(401, 'Unauthorised.')
  // eslint-disable-next-line consistent-return
  public async getObservations(
    @ContextRequest req: RequestWithPageParams,
    @ContextNext next: NextFunction,
    @QueryParam('lang') lang: string = 'eng',
    @QueryParam('pageNumber') pageNumber: number = 0,
    @QueryParam('pageSize') pageSize: number = 5,
    @QueryParam('sortingDirection') sortingDirection: SortingDirection = SortingDirection.asc,
    @QueryParam('sortingColumn') sortingColumn?: string,
    // @ts-ignore FIXME
  ): Promise<ObservationsListResponse> {
    try {
      const langOrigin = LocaleOrigin[lang] ? LocaleOrigin[lang] : 'desc_eng';

      const paramsSearch = parsePageParams({ pageNumber, pageSize, sortingColumn, sortingDirection });
      const paramsAggregation = parseWhereParams(req.query, req.user);

      const [observations, totalElements] = await this.observations.findAndCount(
        Object.assign(paramsSearch, paramsAggregation),
      );

      const f = pipe((arg: [string, any]) => sanitizeUser(arg));

      const content = observations.map(observation =>
        Object.entries(observation)
          .map(arg => f(arg))
          .reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {}),
      ) as ObservationDto;

      return {
        content,
        pageNumber: paramsSearch.number,
        pageSize: paramsSearch.size,
        totalElements,
      };
    } catch (error) {
      next(error);
    }
  }

  // TODO: currently typescript-rest doesn't support [key in keyof smth] syntax
  /**
   * Get all available values for filtering observations.
   * Returns all existing values of observation fields.
   */
  @GET
  @Path('/aggregations')
  @Response<{ [key: string]: string[] | { [key: string]: string }[] }>(
    200,
    'All available values for filtering observations.',
  )
  @Response<CustomError>(401, 'Unauthorised.')
  // eslint-disable-next-line consistent-return
  public async getAggregations(
    @ContextRequest req: Request,
    @ContextNext next: NextFunction,
    // @ts-ignore FIXME
  ): Promise<{ [key: string]: string[] | { [key: string]: string }[] }> {
    try {
      const { query, user } = req;

      const paramsAggregation = parseWhereParams(user, query);
      const observations = await this.observations.find({ ...paramsAggregation });
      const requiredColumnsMap: AggregationsMap = this.requiredColumns.reduce((acc, column) => {
        return Object.assign(acc, { [column]: [] });
      }, {});

      const aggregations = observations.reduce((acc, observation) => {
        this.requiredColumns.forEach(column => {
          const desired = acc[column].find(item => {
            if (typeof observation[column] === 'object' && observation[column] !== null) {
              return item.value.id === (observation[column] as any).id;
            }
            return item.value === observation[column];
          });
          if (desired) {
            desired.count += 1;
          } else {
            const f = pipe((arg: [string, any]) => sanitizeUser(arg));
            const [, value] = f([column, observation[column]]);
            acc[column].push({ value, count: 1 });
          }
        });
        return acc;
      }, requiredColumnsMap);

      return aggregations;
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new observation.
   * @param {RawObservationDto} rawObservation Data for new observation.
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
    @ContextNext next: NextFunction,
    // @ts-ignore FIXME
  ): Promise<ObservationBaseDto> {
    try {
      let { ring } = rawObservation;
      if (!ring) {
        const ringEntity = await this.rings.findOne({ identificationNumber: rawObservation.ringMentioned });
        if (ringEntity) {
          ring = ringEntity.id;
        }
      }
      const newObservation = await Observation.create({ ...rawObservation, ring, finder: req.user.id });
      await this.validate(newObservation);
      // @ts-ignore see https://github.com/typeorm/typeorm/issues/3490
      return await this.observations.save(newObservation);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Get observation by id,
   * @param {string} id Id if requested observation.
   */
  @GET
  @Path('/:id')
  // TODO do we really want to return whole observation with user salt and hash?
  @Response<Observation>(200, 'Observation with passed id.')
  @Response<CustomError>(401, 'Unauthorised.')
  // eslint-disable-next-line consistent-return
  public async findObservation(
    @PathParam('id') id: string,
    @ContextNext next: NextFunction,
    // @ts-ignore FIXME
  ): Promise<Observation> {
    try {
      return await this.checkId<Observation>(id);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Update observation by id,
   * @param rawObservation Data for new updating.
   * @param id Id of updated observation.
   */
  @PUT
  @Path('/:id')
  @Response<Observation>(200, 'Updated observation.')
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(422, 'Unprocessable entity.')
  // eslint-disable-next-line consistent-return
  public async editObservation(
    rawObservation: RawObservationDto,
    @PathParam('id') id: string,
    @ContextNext next: NextFunction,
    // @ts-ignore FIXME
  ): Promise<Observation> {
    // TODO: check user id and role
    try {
      const observation = await this.checkId<Observation>(id);
      let { ring } = rawObservation;
      if (!ring || rawObservation.ringMentioned !== observation.ringMentioned) {
        const ringEntity = await this.rings.findOne({ identificationNumber: rawObservation.ringMentioned });
        if (ringEntity) {
          ring = ringEntity.id;
        }
      }
      await this.validate(Object.assign(rawObservation, { ring }), observation);
      // TODO protect from finder updating
      // @ts-ignore see https://github.com/typeorm/typeorm/issues/3490
      const updatedObservation = await this.observations.merge(observation, rawObservation);
      return await this.observations.save(updatedObservation);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Delete observation by id,
   * @param id Id of deleted observation.
   */
  @DELETE
  @Path('/:id')
  @Response<Observation>(200, 'Updated observation.')
  @Response<CustomError>(401, 'Unauthorised.')
  // eslint-disable-next-line consistent-return
  public async removeObservation(
    @PathParam('id') id: string,
    @ContextNext next: NextFunction,
    // @ts-ignore
  ): Promise<Observation> {
    try {
      const observation = await this.checkId<Observation>(id);
      return await this.observations.remove(observation);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Update verification status for observation.
   * @param payload Id of updated observation and new verification status.
   */
  @POST
  @Path('/set-verification')
  @Response<{ ok: boolean }>(200, 'Updated observation.')
  @Response<CustomError>(400, 'Invalid data.')
  @Response<CustomError>(401, 'Unauthorised.')
  @Response<CustomError>(403, 'Forbidden.')
  @PreProcessor(auth.role(UserRole.Moderator))
  // eslint-disable-next-line consistent-return
  public async setVerificationStatus(
    payload: { id: string; status: Verified },
    @ContextNext next: NextFunction,
    // @ts-ignore
  ): Promise<{ ok: boolean }> {
    try {
      const { id, status } = payload;
      if (!id || !status) {
        throw new CustomError('Id and status are required', 400);
      }
      await this.observations.findOneOrFail(id);
      await this.observations.update(id, { verified: status });
      return { ok: true };
    } catch (e) {
      next(e);
    }
  }

  /**
   * Export observations with passed ids to xls.
   * @param exportedContent.ids Ids of observations to export.
   * @param exportedContent.lang New verified status.
   */
  @POST
  @Path('/export/xls')
  @Produces('application/xlsx')
  @PreProcessor(auth.role(UserRole.Ringer))
  // eslint-disable-next-line consistent-return
  public async exportXls(
    exportedContent: { ids: string[]; lang?: string },
    @ContextNext next: NextFunction,
    // @ts-ignore FIXME
  ): Promise<Return.DownloadBinaryData> {
    try {
      const { ids, lang } = exportedContent;
      const buffer = await this.exporter.handle(ExporterType.xls, ids, lang);
      return new Return.DownloadBinaryData(buffer, 'application/xlsx', 'obs.xlsx');
    } catch (e) {
      next(e);
    }
  }

  /**
   * Get xls template for observations.
   */
  @GET
  @Path('/export/xls')
  @Produces('application/xlsx')
  @PreProcessor(auth.role(UserRole.Ringer))
  // @ts-ignore FIXME
  // eslint-disable-next-line consistent-return
  public async getExportTemplate(@ContextNext next: NextFunction): Promise<Return.DownloadBinaryData> {
    try {
      const buffer = await this.exporter.handle(ExporterType.template);
      return new Return.DownloadBinaryData(buffer, 'application/xlsx', 'obs_template.xlsx');
    } catch (e) {
      next(e);
    }
  }

  /**
   * Export observations with passed ids to euring codes.
   * @param exportedContent Contains ids of observations to export.
   */
  @POST
  @Path('/export/euring')
  @Response<string[]>(200, 'Euring codes of selected observations.')
  @PreProcessor(auth.role(UserRole.Ringer))
  // @ts-ignore FIXME
  // eslint-disable-next-line consistent-return
  public async exportEuring(exportedContent: { ids: string[] }, @ContextNext next: NextFunction): Promise<string[]> {
    try {
      const { ids } = exportedContent;
      return this.exporter.handle(ExporterType.euring, ids);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Export observations with passed id to xls.
   * @param exportedContent contains target language.
   * @param id Id of observation to export.
   */
  @POST
  @Path('/:id/export/xls')
  @Produces('application/xlsx')
  @PreProcessor(auth.role(UserRole.Ringer))
  // eslint-disable-next-line consistent-return
  public async exportXlsSingle(
    exportedContent: { lang?: string },
    @PathParam('id') id: string,
    @ContextNext next: NextFunction,
    // @ts-ignore FIXME
  ): Promise<Return.DownloadBinaryData> {
    try {
      const { lang } = exportedContent;
      const buffer = await this.exporter.handle(ExporterType.xls, [id], lang);
      return new Return.DownloadBinaryData(buffer, 'application/xlsx', 'obs_template.xlsx');
    } catch (e) {
      next(e);
    }
  }

  /**
   * Import observations from xls file.
   * @param files Files in xls format to export.
   */
  @POST
  @Path('/import/xls')
  @PreProcessor(auth.role(UserRole.Ringer))
  // eslint-disable-next-line consistent-return
  public async importXls(
    @FilesParam('files') files: Express.Multer.File[],
    @ContextNext next: NextFunction,
    // @ts-ignore FIXME
  ): Promise<{ ok: boolean }> {
    try {
      await this.importer.handle(XlsImporterType.xls, files);
      return { ok: true };
    } catch (e) {
      next(e);
    }
  }

  /**
   * Validate xls file with observations.
   * @param files Files in xls format to validate.
   */
  @POST
  @Path('/import/validate-xls')
  @PreProcessor(auth.role(UserRole.Ringer))
  // eslint-disable-next-line consistent-return
  public async validateXls(
    @FilesParam('files') files: Express.Multer.File[],
    @ContextNext next: NextFunction,
    // @ts-ignore FIXME
  ): Promise<DataCheckDto> {
    try {
      return this.importer.handle(XlsImporterType.validate, files);
    } catch (e) {
      next(e);
    }
  }

  /**
   * Import observations from euring codes.
   * @param codes Euring codes to export.
   */
  @POST
  @Path('/import/euring')
  @PreProcessor(auth.role(UserRole.Ringer))
  // @ts-ignore FIXME
  // eslint-disable-next-line consistent-return
  public async importEuring(codes: string[], @ContextNext next: NextFunction): Promise<void> {
    try {
      return this.importer.handle(StringImporterType.euring, codes);
    } catch (e) {
      next(e);
    }
  }
}
