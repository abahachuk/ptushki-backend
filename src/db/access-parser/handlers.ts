import { getRepository, Repository } from 'typeorm';
import { EuringAccessTable, EURINGs, mapEURINGCode } from './euring-access-tables';
import { entitySelectAll } from './access-entity-methods';
import { Ring } from '../../entities/ring-entity';
import { logger } from '../../utils/logger';

export async function prepareToUploadEURING(table: EuringAccessTable): Promise<any[]> {
  try {
    const content: any[] = await entitySelectAll(table);
    return mapEURINGCode(table, content);
  } catch (error) {
    logger.error(table, error);
    return [];
  }
}

export async function uploadEURING(instances: any[], tableName: EuringAccessTable): Promise<void> {
  const { Entity } = EURINGs[tableName];
  const repository: Repository<any> = getRepository(Entity);
  await repository.insert(instances);
  logger.info(tableName, ' inserted');
}

export async function uploadRings(rings: Ring[]): Promise<void> {
  try {
    const repository: Repository<Ring> = getRepository(Ring);
    await repository.insert(rings);
  } catch (e) {
    logger.info(
      `Failed when tried to insert rings: [ ${rings
        .map(r => r.identificationNumber)
        .slice(0, 5)
        .join()}... ]`,
    );
    logger.error(e);
  }
}
