import accessConnection from './access-connection';

class AccessError {
  public message: string;

  public constructor(message: string) {
    this.message = message;
  }
}

export async function* getEntityRecords(
  table: string,
  id: string,
  amount: number = 1000,
): AsyncIterableIterator<any[]> {
  let lastId;
  let records: any[];
  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      records = await accessConnection.query(
        `SELECT TOP ${amount} * FROM ${table}${lastId ? ` WHERE ${id} > "${lastId}"` : ''};`,
      );
      if (!records.length) {
        break;
      }
      lastId = records[records.length - 1][id];
      yield records;
    } catch (e) {
      throw new AccessError(e.process.message);
    }
  }
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
