import accessConnection from './access-connection';

export async function entityCount(table: string, id: string): Promise<number> {
  const count: number = await accessConnection.query(`SELECT COUNT(${id}) FROM ${table};`);
  return count;
}

export async function entitySelectAll(table: string): Promise<any[]> {
  const result: any[] = await accessConnection.query(`SELECT * FROM ${table}`);
  return result;
}
