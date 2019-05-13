import { getRepository, Repository } from 'typeorm';
import { EuringAccessTable, EURINGs, mapEURINGCode } from './euring-access-table';
import { entitySelectAll } from './access-entity-methods';
import { Ring } from '../../entities/ring-entity';

export async function prepareToUploadEURING(table: EuringAccessTable): Promise<any[]> {
  try {
    const content: any[] = await entitySelectAll(table);
    return mapEURINGCode(table, content);
  } catch (error) {
    console.error(table, error);
    return [];
  }
}

export async function uploadEURING(instances: any[], tableName: EuringAccessTable): Promise<void> {
  const { Entity } = EURINGs[tableName];
  const repository: Repository<any> = getRepository(Entity);
  await repository.insert(instances);
  console.log(tableName, ' inserted');
}

export async function uploadRings(rings: Ring[]): Promise<void> {
  try {
    const repository: Repository<Ring> = getRepository(Ring);
    await repository.insert(rings);
  } catch (e) {
    console.log(
      `Failed when tried to insert rings: [ ${rings
        .map(r => r.identificationNumber)
        .slice(0, 5)
        .join()}... ]`,
    );
    console.log(e);
  }
}
