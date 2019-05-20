import { FindManyOptions, Repository, FindConditions, FindOneOptions } from 'typeorm';
import { Observation } from '../entities/observation-entity';
/*
  query example:

  ?search=*
  &pageNumber=0
  &pagesize=10
  &sortingColumn=colorRing
  &sortingDirection=ASC
  &finder=id1,id2,id3
  &colorRing=red,green
  &verified=true

*/

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

const reduceWithCount = (arr: any[], columnName: string) => ({
  [columnName]: arr.reduce((acc, row) => Object.assign(acc, { [row[columnName]]: row.count }), {}),
});

const aggregationColumns: string[] = ['distance', 'direction', 'date', 'colorRing', 'placeName', 'remarks', 'verified'];
const aggregationSearch: string[] = ['search', 'pageNumber', 'pageSize', 'sortingColumn', 'sortingDirection'];

const aggregationForeignKeys: ((repsitory: Repository<Observation>) => Promise<{ [x: string]: any }>)[] = [
  async repsitory => {
    const res = await repsitory
      .createQueryBuilder('observation')
      .select(['CONCAT(finder."firstName", \'_\', finder."lastName") AS "finder"', 'count(*)'])
      .innerJoin('observation.finder', 'finder')
      .groupBy('finder."id"')
      .getRawMany();
    return reduceWithCount(res, 'finder');
  },
];

export const parseWhereParams = (query: ObservationAggregations): FindOneOptions<Observation> => {
  const where: FindConditions<Observation>[] = [];

  const params = Object.entries(query)
    .filter(entrie => !aggregationSearch.includes(entrie[0]))
    .map(entrie => ({ [entrie[0]]: entrie[1].split(',') }))
    .reduce((acc, item) => Object.assign(acc, item), {});

  Object.entries(params).forEach(entrie => {
    entrie[1].forEach(item => {
      where.push({ [entrie[0]]: item });
    });
  });

  return { where };
};

export const parseQueryParams = (query: ObservationQuery): FindOptions<Observation> => {
  const { pageNumber, pageSize, sortingColumn, sortingDirection = 'ASC' } = query;

  const number = Number.parseInt(pageNumber as string, 10) || DEFAULT_PAGE_NUMBER;
  const size = Number.parseInt(pageSize as string, 10) || DEFAULT_PAGE_SIZE;

  return {
    loadRelationIds: {
      relations: ['finder'], // to load only id from User entity
    },
    order: sortingColumn ? { [sortingColumn]: sortingDirection } : undefined,
    skip: number * size,
    take: size,
    number,
    size,
    loadEagerRelations: false, // temporary, for dev purposes
    // where: [
    //   { colorRing: 'blue', direction: 'S' },
    //   { colorRing: 'red', direction: 'S' },
    // ]
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
