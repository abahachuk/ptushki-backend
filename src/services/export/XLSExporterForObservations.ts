import stream from 'stream';
import { NextFunction, Request, Response } from 'express';
import { getRepository, Repository } from 'typeorm';
import { write, utils } from 'xlsx';
import AbstractExporter, { ExporterType } from './AbstractExporter';
import { Observation } from '../../entities/observation-entity';

export default class XLSExporterForObservations extends AbstractExporter {
  public type: ExporterType = 'XLS';

  public route: string = 'observations';

  private observations: Repository<Observation> = getRepository(Observation);

  private ObservationColumns = [
    'ringMentioned',
    'photos',
    'distance',
    'direction',
    'elapsedTime',
    'colorRing',
    'date',
    'geographicalCoordinates',
    'placeName',
    'remarks',
    'verified',
  ];

  private ObservationColumnsByDesc = [
    'sexMentioned',
    'sexConcluded',
    'ageMentioned',
    'ageConcluded',
    'manipulated',
    'movedBeforeTheCapture',
    'catchingMethod',
    'catchingLures',
    'accuracyOfDate',
    'accuracyOfCoordinates',
    'status',
    'pullusAge',
    'accuracyOfPullusAge',
    'condition',
    'circumstances',
    'circumstancesPresumed',
  ];

  public async export(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lang = 'desc_eng';
      const qb = this.observations.createQueryBuilder('observation');
      const withSelect = qb.select([
        'ring.id',
        'finder.firstName AS "finder_firstName"',
        'finder.lastName AS "finder_lastName"',
        'finder.role AS "finder_role"',
        'speciesMentioned.species',
        `speciesMentioned.${lang} AS speciesMentioned_desc`,
        'speciesConcluded.species',
        `speciesConcluded.${lang} AS speciesMentioned_desc`,
        ...this.ObservationColumns.map(column => `observation.${column} AS "${column}"`),
        ...this.ObservationColumnsByDesc.map(column => `${column}.${lang} AS "${column}"`),
      ]);

      const withJoins = this.ObservationColumnsByDesc.reduce(
        (acc, column) => acc.leftJoin(`observation.${column}`, column),
        withSelect,
      )
        .leftJoin('observation.ring', 'ring')
        .leftJoin('observation.finder', 'finder')
        .leftJoin('observation.speciesMentioned', 'speciesMentioned')
        .leftJoin('observation.speciesConcluded', 'speciesConcluded');

      const rows = await withJoins.getRawMany();
      const workSheet = utils.json_to_sheet(rows);
      const workBook = utils.book_new();
      utils.book_append_sheet(workBook, workSheet);
      const buffer = write(workBook, { bookType: 'xlsx', type: 'buffer' });
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      res.set('Content-Type', 'application/xlsx');
      bufferStream.pipe(res);
    } catch (e) {
      next(e);
    }
  }
}
