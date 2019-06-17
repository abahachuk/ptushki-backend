// import stream from 'stream';
import { NextFunction, Request, Response } from 'express';
import { getRepository, Repository } from 'typeorm';
// import { write, utils } from 'xlsx';
import AbstractExporter, { ExporterType } from './AbstractExporter';
import { Observation } from '../../entities/observation-entity';
import { User } from '../../entities/user-entity';
// import { parseWhereParams } from '../observation-service';

type Locale = 'desc_eng' | 'desc_rus' | 'desc_byn';

export default class XLSExporterForObservations extends AbstractExporter {
  public type: ExporterType = 'XLS';

  public route: string = 'observations';

  private observations: Repository<Observation> = getRepository(Observation);

  // private ObservationColumns = [
  //   'ringMentioned',
  //   'photos',
  //   'distance',
  //   'direction',
  //   'elapsedTime',
  //   'colorRing',
  //   'date',
  //   'geographicalCoordinates',
  //   'placeName',
  //   'remarks',
  //   'verified',
  // ];
  private defaultLang: Locale = 'desc_eng';

  private languages: string[] = ['desc_eng', 'desc_rus', 'desc_byn'];

  private ObservationColumnsByDesc = [
    'finder',
    'speciesMentioned',
    'speciesConcluded',
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

  private flattenObservation = (observation: Observation, lang: Locale) => {
    return Object.entries(observation).reduce((acc, entrie) => {
      if (typeof entrie[1] === 'object' && entrie[1] !== null) {
        Object.entries(entrie[1])
          .filter(pair => this.filterByLocale(pair[0], lang))
          .forEach(pair => {
            Object.assign(acc, { [`${entrie[0]}_${pair[0]}`]: pair[1] });
          });
        return acc;
      }
      return Object.assign(acc, { [entrie[0]]: entrie[1] });
    }, {});
  };

  private filterByLocale = (key: string, lang: Locale): boolean => {
    if (!this.languages.includes(key)) {
      return true;
    }
    return lang === key;
  };

  public async export(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lang = this.defaultLang }: { lang: Locale } = req.query;

      const observations = await this.observations.find({
        // where: parseWhereParams(req.query, req.user).where,
        loadEagerRelations: false,
        relations: this.ObservationColumnsByDesc,
      });

      observations.map(obs => {
        const ref = obs;
        ref.finder = ref.finder.sanitizeUser() as User;
        return ref;
      });
      const flattenObservations = observations.map(obs => this.flattenObservation(obs, lang));
      // const flattenObservations = observations;

      // console.log(JSON.stringify(flattenObservations, null, 2));

      // const qb = this.observations.createQueryBuilder('observation');
      // const withSelect = qb.select([
      //   'ring.id',
      //   'finder.firstName AS "finder_firstName"',
      //   'finder.lastName AS "finder_lastName"',
      //   'finder.role AS "finder_role"',
      //   'speciesMentioned.species',
      //   `speciesMentioned.${lang} AS speciesMentioned_desc`,
      //   'speciesConcluded.species',
      //   `speciesConcluded.${lang} AS speciesMentioned_desc`,
      //   ...this.ObservationColumns.map(column => `observation.${column} AS "${column}"`),
      //   ...this.ObservationColumnsByDesc.map(column => `${column}.${lang} AS "${column}"`),
      // ]);

      // const withJoins = this.ObservationColumnsByDesc.reduce(
      //   (acc, column) => acc.leftJoin(`observation.${column}`, column),
      //   withSelect,
      // )
      //   .leftJoin('observation.ring', 'ring')
      //   .leftJoin('observation.finder', 'finder')
      //   .leftJoin('observation.speciesMentioned', 'speciesMentioned')
      //   .leftJoin('observation.speciesConcluded', 'speciesConcluded');

      // const rows = await withJoins.getRawMany();
      // const rows: any[] = [];
      // const workSheet = utils.json_to_sheet(rows);
      // const workBook = utils.book_new();
      // utils.book_append_sheet(workBook, workSheet);
      // const buffer = write(workBook, { bookType: 'xlsx', type: 'buffer' });
      // const bufferStream = new stream.PassThrough();
      // bufferStream.end(buffer);
      // res.set('Content-Type', 'application/xlsx');
      // res.set('Content-Disposition', 'attachment; filename="obs.xlsx"');
      // bufferStream.pipe(res);
      res.json(flattenObservations);
    } catch (e) {
      next(e);
    }
  }
}
