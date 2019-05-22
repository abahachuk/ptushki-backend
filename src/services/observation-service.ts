import { FindManyOptions } from 'typeorm';
import { Observation } from '../entities/observation-entity';

/*
  query example:

  ?serach=*
  &pageNumber=0
  &pagesize=10
  &sortingColumn=colorRing
  &sortingDirection=ASC
  &finder=id1,id2,id3
  &sex=id1
  &ring=id1,id2,id3
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

// const DEFAULT_QUERY = '*';
const DEFAULT_PAGE_NUMBER = 0;
const DEFAULT_PAGE_SIZE = 5;

interface FindOptions<Observation> extends FindManyOptions<Observation> {
  number: number;
  size: number;
}

export const parseQueryParams = (query: ObservationQuery): FindOptions<Observation> => {
  const {
    // search = DEFAULT_QUERY,
    pageNumber,
    pageSize,
    sortingColumn,
    sortingDirection = 'ASC',
  } = query;

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
    // loadEagerRelations: false, // temporary, for dev purposes
  };
};
