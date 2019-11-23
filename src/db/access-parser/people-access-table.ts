import { Person } from '../../entities/person-entity';
import { logger } from '../../utils/logger';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PersonMap = { [index in keyof Omit<Person, 'id' | 'ring'>]: string };

export const personMap: PersonMap = {
  name: 'Ringer',
  email: 'e-mail',
  code: 'Ringer cod',
  phone: 'Tel mob',
  altPhone: 'Tel work',
  address: 'Adres',
};

const personsKeys = Object.keys(personMap);

export function peopleMapper(dbRecords: any[]): Person[] {
  const persons: Person[] = dbRecords
    .map((dbPerson: any) => {
      try {
        const observation = personsKeys.reduce((acc: { [index in keyof PersonMap]: any }, key: keyof PersonMap) => {
          const map = personMap[key];
          acc[key] = dbPerson[map];
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
