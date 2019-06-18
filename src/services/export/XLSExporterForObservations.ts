import { NextFunction, Request, Response } from 'express';
import stream from 'stream';
import { getRepository, Repository } from 'typeorm';
import { write, utils } from 'xlsx';
import AbstractExporter, { ExporterType } from './AbstractExporter';
import { Observation } from '../../entities/observation-entity';
import { User } from '../../entities/user-entity';

type Locale = 'desc_eng' | 'desc_rus' | 'desc_byn';

export default class XLSExporterForObservations extends AbstractExporter {
  public type: ExporterType = 'XLS';

  public route: string = 'observations';

  private observations: Repository<Observation> = getRepository(Observation);

  private defaultLang: Locale = 'desc_eng';

  private languages: Locale[] = ['desc_eng', 'desc_rus', 'desc_byn'];

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
    return Object.entries(observation).reduce((acc, [field, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value)
          .filter(([subfield]) => this.filterFieldByLocale(subfield as Locale, lang))
          .forEach(([subfield, subvalue]) => {
            Object.assign(acc, { [this.getColumnName(field, subfield as Locale)]: subvalue });
          });
        return acc;
      }
      return Object.assign(acc, { [field]: value });
    }, {});
  };

  private filterFieldByLocale = (key: Locale, lang: Locale): boolean => {
    if (!this.languages.includes(key)) {
      return true;
    }
    return lang === key;
  };

  private getColumnName = (columnName: string, subColumnName: Locale) => {
    if (this.languages.includes(subColumnName)) {
      return `${columnName}_desc`;
    }
    return `${columnName}_${subColumnName}`;
  };

  public async export(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lang = this.defaultLang, rowIds = [] }: { lang: Locale; rowIds: string[] } = req.body;

      const observations = await this.observations.find({
        where: rowIds.map(id => ({ id })),
        loadEagerRelations: false,
        relations: this.ObservationColumnsByDesc,
      });

      // sanitize user's sensetive data
      observations.map(obs => {
        const ref = obs;
        ref.finder = ref.finder.sanitizeUser() as User;
        return ref;
      });

      const flattenObservations = observations.map(obs => this.flattenObservation(obs, lang));

      const workSheet = utils.json_to_sheet(flattenObservations);
      const workBook = utils.book_new();
      utils.book_append_sheet(workBook, workSheet);
      const buffer = write(workBook, { bookType: 'xlsx', type: 'buffer' });
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      res.set('Content-Type', 'application/xlsx');
      res.set('Content-Disposition', 'attachment; filename="obs.xlsx"');
      bufferStream.pipe(res);
    } catch (e) {
      next(e);
    }
  }
}
