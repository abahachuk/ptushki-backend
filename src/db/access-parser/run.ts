import 'dotenv/config';
// eslint-disable-next-line import/no-extraneous-dependencies
import ADODB from 'node-adodb';
import { Connection, createConnection, getRepository, Repository } from 'typeorm';
import config from '../prepare-db-config';
import { EURINGs } from './EURING-access-tables';
import { logger } from '../../utils/logger';

const accessConnection = ADODB.open(
  'Provider=Microsoft.ACE.OLEDB.12.0;Data Source=MBCRB(2007-30.01.2012).mdb;Persist Security Info=False;',
);

async function query(table: string): Promise<any[]> {
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
    logger.error(table, error);
    return [];
  }
}

async function load(instances: any[], tableName: string) {
  const { Entity } = EURINGs[tableName];
  const repository: Repository<any> = getRepository(Entity);
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
      const instances = await query(tableName);
      if (instances.length) {
        // eslint-disable-next-line no-await-in-loop
        await load(instances, tableName);
      }
    }
  } catch (error) {
    logger.error(error);
  }
})();
