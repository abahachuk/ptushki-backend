import { Repository } from 'typeorm';
import cache from './repositories-cache';

const languages = ['eng', 'rus', 'byn'];
const camelCase = (s: string): string => s[0].toLowerCase() + s.slice(1);

export class CachedRepository<T> extends Repository<T> {
  public async filterDescsForLang(ln: string = 'eng'): Promise<T[]> {
    if (!languages.includes(ln)) {
      // eslint-disable-next-line
      ln = 'eng';
    }
    const records = await this.getAll();
    const langsToRemove = languages.map(i => `desc_${i}`).filter((desc: string) => !(desc.indexOf(ln) > -1));
    const result = records.map((item: T) => {
      const newItem: T & Record<string, any> = Object.assign({}, item);
      langsToRemove.forEach(lang => {
        delete newItem[lang];
      });
      return newItem;
    });
    return result;
  }

  public async getAll(): Promise<T[]> {
    const { name: key } = this.metadata;
    if (!cache.has(key)) {
      cache.set(key, await super.find());
    }
    return cache.get(key);
  }

  public async getAllIds(): Promise<(string | number)[]> {
    const key = `${this.metadata.name}_allIds`;
    if (!cache.has(key)) {
      cache.set(key, (await this.getAll()).map(({ id }: Record<string, any>) => id));
    }
    return cache.get(key);
  }

  public get tableName(): string {
    return camelCase(this.metadata.name);
  }
}
