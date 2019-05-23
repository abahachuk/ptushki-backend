import { Repository } from 'typeorm';
import cache from './repositories-cache';

const camelCase = (s: string) => s[0].toLowerCase() + s.slice(1);

export class CachedRepository<T> extends Repository<T> {
  public async find(): Promise<T[]> {
    const { name: key } = this.metadata;
    if (!cache.has(key)) {
      cache.set(key, await super.find());
    }
    return cache.get(key);
  }

  public get tableName(): string {
    return camelCase(this.metadata.name);
  }
}
