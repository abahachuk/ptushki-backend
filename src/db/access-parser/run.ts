import 'dotenv/config';
// eslint-disable-next-line import/no-extraneous-dependencies
import ADODB from 'node-adodb';
import { Connection, createConnection, getRepository, Repository } from 'typeorm';
import config from '../prepare-db-config';
import { EURINGs } from './EURING-access-tables';
import { ringMapper, RingMapper } from './rings-access-table';
import { Ring } from '../../entities/ring-entity';

const accessConnection = ADODB.open(
  'Provider=Microsoft.ACE.OLEDB.12.0;Data Source=MBCRB(2007-30.01.2012).mdb;Persist Security Info=False;',
);

async function getEuring(table: string): Promise<any[]> {
  try {
    const { Entity, mapping } = EURINGs[table];
    const keys: string[] = [...mapping.keys()];
    const content: { [index: string]: any }[] = await accessConnection.query(`SELECT * FROM ${table}`);
    return content.map((item: { [index: string]: any }) =>
      Object.assign(
        new Entity(),
        keys.reduce((acc: { [index: string]: string }, key: string) => {
          const value = item[mapping.get(key) as string];
          if (value) {
            acc[key] = value;
          }
          return acc;
        }, {}),
      ),
    );
  } catch (error) {
    console.error(table, error);
    return [];
  }
}

async function loadEURING(instances: any[], tableName: string): Promise<void> {
  const { Entity } = EURINGs[tableName];
  const repository: Repository<any> = getRepository(Entity);
  await repository.insert(instances);
  console.log(tableName, ' inserted');
}

async function getRings(): Promise<Ring[]> {
  const limit = 100;
  const dbRings: any[] = await accessConnection.query(`SELECT TOP ${limit} * FROM Ringby`);
  const rings: Ring[] = dbRings
    .map((dbRing: any) => {
      try {
        const ring = Object.keys(ringMapper).reduce(
          (acc: { [index in keyof RingMapper]: any }, key: keyof RingMapper) => {
            const map = ringMapper[key];
            acc[key] = typeof map === 'function' ? map(dbRing) : dbRing[map];
            return acc;
          },
          {},
        );
        return ring;
      } catch (e) {
        return null;
      }
    })
    .filter(ring => !!ring)
    .map(mapped => Object.assign(new Ring(), mapped));
  return rings;
}

async function loadRings(instances: any[]): Promise<void> {
  const repository: Repository<any> = getRepository(Ring);
  await repository.insert(instances);
}

let db: Connection | undefined;

(async () => {
  try {
    db = await createConnection(config);
    await db.synchronize(true);
    // eslint-disable-next-line no-restricted-syntax
    for (const tableName of Object.keys(EURINGs)) {
      // eslint-disable-next-line no-await-in-loop
      const instances = await getEuring(tableName);
      if (instances.length) {
        // eslint-disable-next-line no-await-in-loop
        await loadEURING(instances, tableName);
      }
    }

    const rings = await getRings();
    await loadRings(rings);
  } catch (e) {
    console.log(e);
  }
})();
