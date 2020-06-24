import { getRepository, Repository } from 'typeorm';
import { write, utils } from 'xlsx';
import AbstractExporter, { ExporterType } from './AbstractExporter';
import { Observation } from '../../entities/observation-entity';
import { User } from '../../entities/user-entity';
import { Lang } from '../../common-types/Lang';

export default class XLSExporterForObservations extends AbstractExporter<Buffer> {
  public type: ExporterType = ExporterType.xls;

  public route: string = 'observations';

  private observations: Repository<Observation> = getRepository(Observation);

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

  private flattenObservation = (observation: Observation) => {
    return Object.entries(observation).reduce((acc, [field, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subfield, subvalue]) => {
          Object.assign(acc, { [this.getColumnName(field, subfield as Lang)]: subvalue });
        });
        return acc;
      }
      return Object.assign(acc, { [field]: value });
    }, {});
  };

  private getColumnName = (columnName: string, subColumnName: Lang) => {
    return `${columnName}_${subColumnName}`;
  };

  public async export(rowIds: string[]): Promise<Buffer> {
    this.validateRowIds(rowIds);
    const observations = await this.observations.find({
      where: rowIds.map(id => ({ id })),
      loadEagerRelations: false,
      relations: this.ObservationColumnsByDesc,
    });

    // sanitize user's sensetive data
    observations.map(obs => {
      const ref = obs;
      ref.finder = User.sanitizeUser(ref.finder) as User;
      return ref;
    });

    const flattenObservations = observations.map(obs => this.flattenObservation(obs));
    const workSheet = utils.json_to_sheet(flattenObservations);
    const workBook = utils.book_new();
    utils.book_append_sheet(workBook, workSheet);
    return write(workBook, { bookType: 'xlsx', type: 'buffer' });
  }
}
