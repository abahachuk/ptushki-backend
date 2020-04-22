import { Repository } from 'typeorm';
import cache from './repositories-cache';

const languages = ['eng', 'rus', 'byn'];
const camelCase = (s: string): string => s[0].toLowerCase() + s.slice(1);

export class CachedRepository<T> extends Repository<T> {
  public async filterByLang(
    ln: string,
  ): Promise<(Pick<T, Exclude<keyof T, 'desc_rus' | 'desc_eng' | 'desc_byn'>> & { desc: any })[]> {
    const lang = languages.includes(ln) ? ln : languages[0];
    const key = `${this.metadata.name}_${lang}`;
    if (cache.has(key)) {
      return cache.get(key);
    }

    const records = await this.findAll();
    const result = records.map((item: T & Record<string, any>) => {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const { desc_eng, desc_rus, desc_byn, ...rest } = item;
      const desc = `desc_${lang}`;
      const newItem = Object.assign({}, rest, { desc: item[desc] });
      return newItem;
    });
    cache.set(key, result);
    return result;
  }

  public async findAll(): Promise<T[]> {
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
