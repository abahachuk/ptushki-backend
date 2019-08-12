import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Observation } from '../entities/observation-entity';
import { User } from '../entities/user-entity';
import {
  filterFieldByLocale,
  Locale,
  LocaleOrigin,
  ObservationQuery,
  parsePageParams,
  parseWhereParams,
} from '../services/observation-service';

@Injectable()
export class ObservationsService {
  private readonly observations: Repository<Observation>;

  public constructor(
    @Inject('OBSERVATIONS_REPOSITORY')
    observations: Repository<Observation>,
  ) {
    this.observations = observations;
  }

  public async getAll(user: User, query: ObservationQuery) {
    const { lang = 'eng' } = query;
    const langOrigin = LocaleOrigin[lang] ? LocaleOrigin[lang] : 'desc_eng';

    const paramsSearch = parsePageParams(query);
    const paramsAggregation = parseWhereParams(query, user);
    const observations = await this.observations.findAndCount(Object.assign(paramsSearch, paramsAggregation));

    const content = observations[0].map(obs => {
      // sanitaze user's data
      const finder = Object.assign({}, obs.finder.sanitizeUser(), { id: obs.finder.id });
      // transform 'observation'
      const observation = Object.entries(obs)
        // clear 'filter' field
        .filter(([ObservationField]) => ObservationField !== 'ring')
        // map 'lang' param according 'Locale'
        .map(([ObservationKey, ObservationValue]) => {
          if (typeof ObservationValue === 'object' && ObservationValue !== null) {
            const value = Object.entries(ObservationValue)
              .filter(([subfield]) => filterFieldByLocale(subfield as Locale, langOrigin))
              .map(([subfield, subValue]) =>
                subfield === langOrigin ? ['desc', subValue] : ([subfield, subValue] as any),
              )
              .reduce((acc, [subfield, subValue]) => Object.assign(acc, { [subfield]: subValue }), {});
            return [ObservationKey, value];
          }
          return [ObservationKey, ObservationValue];
        })
        .reduce(
          (acc, [ObservationField, ObservationValue]) => Object.assign(acc, { [ObservationField]: ObservationValue }),
          {},
        );
      return Object.assign({}, observation, { finder }, { ring: obs.ring.id });
    });

    return {
      content,
      pageNumber: paramsSearch.number,
      pageSize: paramsSearch.size,
      totalElements: observations[1],
    };
  }
}
