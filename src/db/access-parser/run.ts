import 'dotenv/config';
import { Connection, createConnection } from 'typeorm';

import './access-connection';
import config from '../prepare-db-config';
import { EURINGs, EuringAccessTable } from './euring-access-tables';
import { prepareToUploadEURING, uploadEURING, uploadPersons, uploadRings, uploadObservations } from './handlers';
import { logger } from '../../utils/logger';

let db: Connection | undefined;

const tables: { [index: string]: { name: string; id?: string } } = {
  persons: {
    name: 'Ringer_information',
  },
  rings: {
    name: 'Ringby',
    id: 'RN',
  },
  observations: {
    name: 'Ringby_recov',
    id: 'RefNo',
  },
};

(async () => {
  try {
    console.time('Total');
    logger.info('Parsing started');
    db = await createConnection(config);
    logger.info('DB connected');
    await db.synchronize(true);
    logger.info('DB dropped and synced');

    console.time('EURING codes');
    // eslint-disable-next-line no-restricted-syntax
    for (const tableName of Object.keys(EURINGs) as EuringAccessTable[]) {
      // eslint-disable-next-line no-await-in-loop
      const records = await prepareToUploadEURING(tableName);
      if (records.length) {
        // eslint-disable-next-line no-await-in-loop
        await uploadEURING(records, tableName);
      }
    }
    console.timeEnd('EURING codes');

    console.time('Persons');
    const personsHash = await uploadPersons(tables.persons.name);
    console.timeEnd('Persons');

    console.time('Rings');
    const ringsHash = await uploadRings(tables.rings.name, tables.rings.id as string, personsHash);
    console.timeEnd('Rings');

    console.time('Observations');
    await uploadObservations(tables.observations.name, tables.observations.id as string, personsHash, ringsHash);
    console.timeEnd('Observations');
    console.timeEnd('Total');
  } catch (error) {
    logger.error(error);
  }
})();
