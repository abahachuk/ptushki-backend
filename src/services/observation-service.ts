import { FindManyOptions, Repository, FindOneOptions } from 'typeorm';
import { Observation } from '../entities/observation-entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cartesian = require('cartesian-product');

export type ObservationAggregations = { [key in keyof Observation]: string };

export interface ObservationSearch {
  search: string | undefined;
  pageNumber: string | undefined;
  pageSize: string | undefined;
  sortingColumn: string | undefined;
  sortingDirection: 'ASC' | 'DESC';
}

export type ObservationQuery = ObservationSearch & ObservationAggregations;

const DEFAULT_PAGE_NUMBER = 0;
const DEFAULT_PAGE_SIZE = 5;

interface FindOptions<Observation> extends FindManyOptions<Observation> {
  number: number;
  size: number;
}

const reduceWithCount = (arr: any[], columnName: string, id?: string) => {
  if (arr[0].count === '0') {
    return {};
  }
  return {
    [columnName]: arr.reduce((acc, row) => Object.assign(acc, { [row[id || columnName]]: { ...row } }), {}),
  };
};

const aggregationColumns: string[] = ['distance', 'direction', 'date', 'colorRing', 'placeName', 'remarks', 'verified'];
const aggregationSearch: string[] = ['search', 'pageNumber', 'pageSize', 'sortingColumn', 'sortingDirection'];

const aggregationForeignKeys: ((repsitory: Repository<Observation>) => Promise<{ [x: string]: any }>)[] = [
  async repsitory => {
    const res = await repsitory
      .createQueryBuilder('observation')
      .select(['finder."id"', 'finder."firstName"', 'finder."lastName"', 'finder."role"', 'count(*)'])
      .innerJoin('observation.finder', 'finder')
      .groupBy('finder."id"')
      .getRawMany();
    return reduceWithCount(res, 'finder', 'id');
  },
];

export const parseWhereParams = (query: ObservationAggregations): FindOneOptions<Observation> => {
  const params = Object.entries(query)
    .filter(entrie => !aggregationSearch.includes(entrie[0]))
    .map(entrie => ({ [entrie[0]]: entrie[1].split(',') }))
    .reduce((acc, item) => Object.assign(acc, item), {});
  const matrix = Object.entries(params).map(entrie => entrie[1].map(value => ({ [entrie[0]]: value })));
  const where = cartesian(matrix).map((row: any[]) => row.reduce((acc, value) => Object.assign(acc, value), {}));
  return { where };
};

export const parsePageParams = (query: ObservationQuery): FindOptions<Observation> => {
  const { pageNumber, pageSize, sortingColumn, sortingDirection = 'ASC' } = query;

  const number = Number.parseInt(pageNumber as string, 10) || DEFAULT_PAGE_NUMBER;
  const size = Number.parseInt(pageSize as string, 10) || DEFAULT_PAGE_SIZE;

  return {
    loadRelationIds: {
      relations: ['finder', 'ring'], // to load only id from User entity
    },
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
