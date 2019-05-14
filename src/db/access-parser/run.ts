import 'dotenv/config';
import { Connection, createConnection } from 'typeorm';

import './access-connection';
import config from '../prepare-db-config';
import { EURINGs, EuringAccessTable } from './euring-access-table';
import { ringMapper } from './rings-access-table';
import { getEntityRecords } from './access-entity-methods';
import { prepareToUploadEURING, uploadEURING, uploadRings } from './handlers';
import { logger } from '../../configs/logger';

let db: Connection | undefined;

(async () => {
  try {
    db = await createConnection(config);
    await db.synchronize(true);
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

    console.time('Rings');
    // eslint-disable-next-line no-restricted-syntax
    for await (const dbRings of getEntityRecords('Ringby', 'RN')) {
      const rings = ringMapper(dbRings);
      await uploadRings(rings);
    }
    console.timeEnd('Rings');
  } catch (error) {
    logger.error(error);
  }
})();
