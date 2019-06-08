import config from 'config';
import { FindManyOptions, Repository, FindOneOptions } from 'typeorm';
import { Observation } from '../entities/observation-entity';
import { User, UserRole } from '../entities/user-entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cartesian = require('cartesian-product');

const { pageNumberDefault, pageSizeDefault } = config.get('paging');

export type ObservationAggregations = { [key in keyof Observation]: string };

export interface ObservationSearch {
  search?: string;
  pageNumber?: string;
  pageSize?: string;
  sortingColumn?: string;
  sortingDirection?: 'ASC' | 'DESC';
}

export type ObservationQuery = ObservationSearch & ObservationAggregations;

interface FindOptions<Observation> extends FindManyOptions<Observation> {
  number: number;
  size: number;
}

const gettingAllObservations = {
  [UserRole.Observer]: false,
  [UserRole.Ringer]: false,
  [UserRole.Scientist]: true,
  [UserRole.Moderator]: true,
  [UserRole.Admin]: true,
};

const reduceWithCount = (arr: any[], columnName: string) => {
  if (arr[0].count === '0') {
    return {};
  }
  return {
    [columnName]: arr.map(row => ({
      value: row[columnName] === undefined ? { ...row, count: undefined } : row[columnName],
      count: row.count,
    })),
  };
};

const aggregationColumns: string[] = ['speciesMentionedId', 'speciesConcludedId', 'verified', 'ringId'];
const aggregationSearch: string[] = ['search', 'pageNumber', 'pageSize', 'sortingColumn', 'sortingDirection'];

const aggregationForeignKeys: ((repository: Repository<Observation>) => Promise<{ [x: string]: any }>)[] = [
  async repository => {
    const res = await repository
      .createQueryBuilder('observation')
      .select(['finder."id"', 'finder."firstName"', 'finder."lastName"', 'finder."role"', 'count(*)'])
      .innerJoin('observation.finder', 'finder')
      .groupBy('finder."id"')
      .getRawMany();
    return reduceWithCount(res, 'finder');
  },
];

export const parseWhereParams = (query: ObservationAggregations, user: User): FindOneOptions<Observation> => {
  const params = Object.entries(query)
    .filter(entrie => !aggregationSearch.includes(entrie[0])) // filter search aggregations, only ObservationAggregations could be applied
    .map(entrie => ({ [entrie[0]]: entrie[1].split(',') })) // split values by ','
    .reduce((acc, item) => Object.assign(acc, item), {}); // reduce splitted values into object

  if (!gettingAllObservations[user.role]) {
    params.finder = [user.id]; // re-assing user id for 'observer' and 'ringer'
  }

  const matrix = Object.entries(params).map(entrie => entrie[1].map(value => ({ [entrie[0]]: value }))); // get matrix to calc a cartesian product for 'where' params
  const where = cartesian(matrix).map((row: any[]) => row.reduce((acc, value) => Object.assign(acc, value), {}));
  return { where };
};

export const parsePageParams = (query: ObservationQuery): FindOptions<Observation> => {
  const { pageNumber, pageSize, sortingColumn, sortingDirection = 'ASC' } = query;

  const number = Number.parseInt(pageNumber as string, 10) || pageNumberDefault;
  const size = Number.parseInt(pageSize as string, 10) || pageSizeDefault;

  return {
    order: sortingColumn ? { [sortingColumn]: sortingDirection } : undefined,
    skip: number * size,
    take: size,
    number,
    size,
  };
};

export const getAggregations = async (repsitory: Repository<Observation>) => {
  const promisesByForeignKeys = aggregationForeignKeys.map(action => action(repsitory));
  const promiseByColumns = aggregationColumns.map(column =>
    repsitory
      .createQueryBuilder('observation')
      .select(`"${column}"`)
      .addSelect(`count("${column}")`)
      .groupBy(`"${column}"`)
      .getRawMany()
      .then(res => reduceWithCount(res, column)),
  );
  const res = await Promise.all([...promiseByColumns, ...promisesByForeignKeys]);
  return res.reduce((acc, item) => Object.assign(acc, item), {});
};

export const sanitizeObservations = (observations: Observation[]) => {
  return observations.map(observation => {
    const ref = observation;
    delete ref.finder.hash;
    delete ref.finder.salt;
    delete ref.finder.email;
    return ref;
  });
};
