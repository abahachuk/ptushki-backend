import { Person } from '../../entities/person-entity';
import { logger } from '../../utils/logger';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PersonMap = {
  [index in keyof Omit<Person, 'id' | 'ring' | 'observation'>]: ((...args: any) => any) | string
};

export const trimName = (name: string): string => name && name.trim().replace(/\s\s+/g, ' ');

const name = (item: any, set: Set<string>): string | null => {
  const processedName = trimName(item.Ringer);
  if (!processedName) {
    return null;
  }
  if (set.has(processedName.toLowerCase())) {
    throw new Error(`Duplicated person: ${processedName}`);
  }

  set.add(processedName.toLowerCase());
  return processedName;
};

export const personMap: PersonMap = {
  name,
  email: 'e-mail',
  code: 'Ringer cod',
  phone: 'Tel mob',
  altPhone: 'Tel work',
  address: 'Adres',
};

const personsKeys = Object.keys(personMap);

export function personMapper(dbRecords: any[]): Person[] {
  const personSet = new Set();
  const persons: Person[] = dbRecords
    .map((dbPerson: any) => {
      try {
        const observation = personsKeys.reduce((acc: { [index in keyof PersonMap]: any }, key: keyof PersonMap) => {
          const map = personMap[key];
          acc[key] = typeof map === 'function' ? map(dbPerson, personSet) : dbPerson[map];
          return acc;
        }, {});
        return observation;
      } catch (e) {
        logger.error(`Person ${dbPerson[personMap.name as string]} can't be mapped -- skipped: ${e}`);
        return null;
      }
    })
    .filter(observation => !!observation)
    .map(mapped => Object.assign(new Person(), mapped));
  return persons;
}
