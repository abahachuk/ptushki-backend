import accessConnection from './access-connection';
import { logger } from '../../utils/logger';

class AccessError {
  public message: string;

  public constructor(message: string) {
    this.message = message;
  }
}

export async function* getEntityRecords(
  table: string,
  id: string,
  // 1000 is about maximum  'bind message supplies X parameters, but prepared statement "" requires more then X',
  amount: number = 1000,
): AsyncIterableIterator<any[]> {
  let startPosition = 0;
  let records: any[];
  let lastId: string | null = null;
  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      records = await accessConnection.query(
        `SELECT *
          FROM (
              SELECT TOP ${amount} *
              FROM (
                  SELECT TOP ${startPosition * amount + amount} *
                  FROM ${table}
                  ORDER BY ${id}
              ) sub
             ORDER BY sub.${id} DESC
          ) subOrdered
          ORDER BY subOrdered.${id}`,
      );

      // eslint-disable-next-line no-loop-func
      const intersectionIndex = records.findIndex(r => r[id] === lastId);
      if (intersectionIndex >= 0) {
        records = records.slice(intersectionIndex + 1);
        break;
      }
      startPosition += 1;
      lastId = records[records.length - 1][id];
      logger.info(`Processed ${startPosition * amount + amount} records`);
      yield records;
    } catch (e) {
      throw new AccessError(e.process.message);
    }
  }
  yield records;
}

export async function entityCount(table: string, id: string): Promise<number> {
  const count: number = await accessConnection.query(`SELECT COUNT(${id}) FROM ${table};`);
  return count;
}

export async function entitySelectAll(table: string): Promise<any[]> {
  try {
    const result: any[] = await accessConnection.query(`SELECT * FROM ${table}`);
    return result;
  } catch (e) {
    throw new AccessError(e.process.message);
  }
}
