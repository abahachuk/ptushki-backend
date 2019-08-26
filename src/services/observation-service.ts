import config from 'config';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { Observation } from '../entities/observation-entity';
import { User, UserRole } from '../entities/user-entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cartesian = require('cartesian-product');

const { pageNumberDefault, pageSizeDefault } = config.get('paging');

export type Locale = 'desc_eng' | 'desc_rus' | 'desc_byn';
export const languages: Locale[] = ['desc_eng', 'desc_rus', 'desc_byn'];
export const LocaleOrigin: { [x: string]: Locale } = {
  eng: 'desc_eng',
  byn: 'desc_byn',
  rus: 'desc_rus',
};

export type ObservationAggregations = { [key in keyof Observation]: string };

export interface ObservationSearch {
  search?: string;
  pageNumber?: string;
  pageSize?: string;
  sortingColumn?: string;
  sortingDirection?: 'ASC' | 'DESC';
  lang: Locale;
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

export const filterFieldByLocale = (key: Locale, lang: Locale): boolean => {
  if (!languages.includes(key)) {
    return true;
  }
  return lang === key;
};

export const mapLocale = (obsEntry: [string, any], lang: Locale): [string, any] => {
  const [observationKey, observationValue] = obsEntry;
  if (typeof observationValue === 'object' && observationValue !== null) {
    const value = Object.entries(observationValue)
      .filter(([field]) => filterFieldByLocale(field as Locale, lang))
      .map(entrie => (entrie[0] === lang ? ['desc', entrie[1]] : entrie))
      .reduce((acc, [subfield, subValue]) => Object.assign(acc, { [subfield as string]: subValue as any }), {});

    return [observationKey, value];
  }
  return obsEntry;
};

export const sanitizeUser = (obsEntry: [string, any]): [string, any] => {
  const [observationKey, observationValue] = obsEntry;
  if (observationKey === 'finder') {
    const finder = User.sanitizeUser(observationValue);
    return [observationKey, finder];
  }
  return obsEntry;
};

const aggregationSearch: string[] = ['search', 'pageNumber', 'pageSize', 'sortingColumn', 'sortingDirection'];

export const parseWhereParams = (user: User, query: ObservationAggregations): FindOneOptions<Observation> => {
  const params = Object.entries(query)
    .filter(entrie => !aggregationSearch.includes(entrie[0])) // filter search aggregations, only ObservationAggregations could be applied
    .map(entrie => ({ [entrie[0]]: entrie[1] && entrie[1].split(',') })) // split values by ','
    .reduce((acc, item) => Object.assign(acc, item), {}); // reduce splitted values into object

  if (!gettingAllObservations[user.role]) {
    params.finder = [user.id]; // re-assing user id for 'observer' and 'ringer'
  }

  const matrix = Object.entries(params).map(entrie => entrie[1] && entrie[1].map(value => ({ [entrie[0]]: value }))); // get matrix to calc a cartesian product for 'where' params
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
