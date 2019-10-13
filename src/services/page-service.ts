import config from 'config';
import { FindManyOptions } from 'typeorm';

import { Search } from '../entities/common-interfaces';

const { pageNumberDefault, pageSizeDefault } = config.get('paging');

interface FindOptions<T> extends FindManyOptions<T> {
  number: number;
  size: number;
}

export const parsePageParams = <T>(query: Search): FindOptions<T> => {
  const { pageNumber, pageSize, sortingColumn, sortingDirection = 'ASC' } = query;

  const number = pageNumber || pageNumberDefault;
  const size = pageSize || pageSizeDefault;

  return {
    // @ts-ignore
    order: sortingColumn ? { [sortingColumn]: sortingDirection } : undefined,
    skip: number * size,
    take: size,
    number,
    size,
  };
};
