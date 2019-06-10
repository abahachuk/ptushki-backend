import { EntityRepository, ObjectType } from 'typeorm';
import * as codes from './index';
import { CachedRepository } from '../cached-repository';

const createRepository = (name: string, cls: any): ObjectType<any> =>
  ({
    [name]: class extends cls<any> {},
  }[name]);

export const cachedEURINGCodes: { [index: string]: ObjectType<any> } = Object.keys(codes).reduce(
  (acc: any, entityName: string) => {
    // @ts-ignore
    const entity = codes[entityName];
    const name = `Cached${entity.name}`;
    acc[name] = createRepository(name, CachedRepository);
    // README EntityRepository decorator doesnt returns target
    EntityRepository(entity)(acc[name]);
    return acc;
  },
  {},
);
