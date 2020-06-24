import { FindOneOptions } from 'typeorm';
import { Search } from './page-service';
import { Observation } from '../entities/observation-entity';
import { User, UserRole } from '../entities/user-entity';
import { Lang } from '../common-types/Lang';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cartesian = require('cartesian-product');

export type ObservationAggregations = { [key in keyof Observation]: string };

export type ObservationQuery = Search & ObservationAggregations & { lang: Lang };

const gettingAllObservations = {
  [UserRole.Observer]: false,
  [UserRole.Ringer]: false,
  [UserRole.Scientist]: true,
  [UserRole.Moderator]: true,
  [UserRole.Admin]: true,
};

export const sanitizeUser = (observationEntry: [string, any]): [string, any] => {
  const [observationKey, observationValue] = observationEntry;
  if (observationKey === 'finder' && observationValue) {
    const finder = User.sanitizeUser(observationValue);

    return [observationKey, finder];
  }

  return observationEntry;
};

const aggregationSearch: string[] = ['search', 'pageNumber', 'pageSize', 'sortingColumn', 'sortingDirection'];

export const parseWhereParams = (user: User, query: ObservationAggregations): FindOneOptions<Observation> => {
  const params = Object.entries(query)
    .filter(([key]) => !aggregationSearch.includes(key)) // filter search aggregations, only ObservationAggregations could be applied
    .map(([key, value]) => ({ [key]: value && value.split(',') })) // split values by ','
    .reduce((acc, item) => Object.assign(acc, item), {}); // reduce splitted values into object

  if (!gettingAllObservations[user.role]) {
    params.finder = [user.id]; // re-assing user id for 'observer' and 'ringer'
  }

  const matrix = Object.entries(params).map(([key, value]) => value && value.map(value1 => ({ [key]: value1 }))); // get matrix to calc a cartesian product for 'where' params
  const where = cartesian(matrix).map((row: any[]) => row.reduce((acc, value) => Object.assign(acc, value), {}));
  return { where };
};
