import { EntityManager, ObjectType } from 'typeorm';
import cache from './repositories-cache';

export class CachedRepository<T> {
  public entity: ObjectType<T>;

  private manager: EntityManager;

  protected constructor(manager: EntityManager, entity: ObjectType<T>) {
    this.manager = manager;
    this.entity = entity;
  }

  public async find(): Promise<T[]> {
    const { name: key } = this.entity;
    if (!cache.has(key)) {
      cache.set(key, await this.manager.find(this.entity));
    }
    return cache.get(key);
  }
}
