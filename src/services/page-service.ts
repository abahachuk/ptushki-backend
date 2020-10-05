import config from 'config';
import { FindManyOptions } from 'typeorm';

const { pageNumberDefault, pageSizeDefault, sortingDirectionDefault } = config.get('paging');

// eslint-disable-next-line no-shadow
export enum SortingDirection {
  asc = 'ASC',
  desk = 'DESC',
}

export interface Search {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  sortingColumn?: string;
  sortingDirection?: SortingDirection;
}

interface FindOptions<T> extends FindManyOptions<T> {
  pageNumber: number;
  pageSize: number;
}

export const parsePageParams = <T>(query: Search): FindOptions<T> => {
  const {
    pageNumber = pageNumberDefault,
    pageSize = pageSizeDefault,
    sortingColumn,
    sortingDirection = sortingDirectionDefault,
  } = query;

  return {
    // @ts-ignore
    order: sortingColumn ? { [sortingColumn]: sortingDirection } : undefined,
    skip: pageNumber * pageSize,
    take: pageSize,
    pageNumber,
    pageSize,
  };
};
