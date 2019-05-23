import { Repository } from 'typeorm';
import cache from './repositories-cache';

const languages = ['eng', 'rus', 'byn'];
const camelCase = (s: string): string => s[0].toLowerCase() + s.slice(1);

export class CachedRepository<T> extends Repository<T> {
  public async findByLang(ln: string = 'eng'): Promise<T[]> {
    if (!languages.includes(ln)) {
      // eslint-disable-next-line
      ln = 'eng';
    }
    const { name: key } = this.metadata;
    if (!cache.has(key)) {
      cache.set(key, await super.find());
    }
    const langsToRemove = languages.map(i => `desc_${i}`).filter((desc: string) => !(desc.indexOf(ln) > -1));
    // @ts-ignore
    const result = cache.get(key).map((item: T) => {
      const newItem: { [index: string]: any } = Object.assign({}, item);
      langsToRemove.forEach(lang => {
        delete newItem[lang];
      });
      return newItem;
    });
    return result;
  }

  public get tableName(): string {
    return camelCase(this.metadata.name);
  }
}
