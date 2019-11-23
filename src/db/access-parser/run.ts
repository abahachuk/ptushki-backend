import 'dotenv/config';
import { Connection, createConnection } from 'typeorm';

import './access-connection';
import config from '../prepare-db-config';
import { EURINGs, EuringAccessTable } from './euring-access-tables';
import { prepareToUploadEURING, uploadEURING, uploadPersons, uploadRings, uploadObservations } from './handlers';
import { logger } from '../../utils/logger';

let db: Connection | undefined;

(async () => {
  try {
    logger.info('Stared parsing');
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
    const personsHash = await uploadPersons();
    console.timeEnd('Persons');

    console.time('Rings');
    const ringsHash = await uploadRings(personsHash);
    console.timeEnd('Rings');

    console.time('Observations');
    await uploadObservations(personsHash, ringsHash);
    console.timeEnd('Observations');
  } catch (error) {
    logger.error(error);
  }
})();
