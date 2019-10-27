import { getRepository, Repository } from 'typeorm';
import { EuringAccessTable, EURINGs, mapEURINGCode } from './euring-access-tables';
import { entitySelectAll, getEntityRecords } from './access-entity-methods';
import { Ring } from '../../entities/ring-entity';
import { logger } from '../../utils/logger';
import { ringMapper } from './rings-access-table';

async function batchedHandler(depth: number, cb: Function, items: any[], collectErrors: boolean) {
  const itemsCopy = items.slice();
  let erroredItems: any[] = [];
  const errors = [];
  let selection = itemsCopy.splice(0, depth);
  while (selection.length) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await cb(selection);
    } catch (e) {
      erroredItems = erroredItems.concat(selection);
      if (collectErrors) {
        errors.push(`[${e.name}]: ${e.message}. ${e.detail}`);
      }
    }
    selection = itemsCopy.splice(0, depth);
  }
  return { erroredItems, errors };
}

async function funnelProcessor(funnel: number[], items: any[], cb: Function): Promise<any> {
  let itemsCopy = items.slice();
  let errors;

  while (true) {
    const depth = funnel.shift();
    const isFunnelEnded = !funnel.length;
    logger.info(`Funnel processor started handling with selection size of ${depth}`);
    // eslint-disable-next-line no-await-in-loop
    ({ erroredItems: itemsCopy, errors } = await batchedHandler(depth as number, cb, itemsCopy, isFunnelEnded));
    if (!funnel.length) {
      break;
    }
  }
  return errors;
}

export async function prepareToUploadEURING(table: EuringAccessTable): Promise<any[]> {
  try {
    const content: any[] = await entitySelectAll(table);
    return mapEURINGCode(table, content);
  } catch (error) {
    logger.error(error);
    return [];
  }
}

export async function uploadEURING(instances: any[], tableName: EuringAccessTable): Promise<void> {
  const { Entity } = EURINGs[tableName];
  const repository: Repository<any> = getRepository(Entity);
  await repository.insert(instances);
  logger.info(`${tableName} inserted`);
}

export async function uploadRings(): Promise<Map<string, string>> {
  const repository: Repository<Ring> = getRepository(Ring);
  const idsHash: Map<string, string> = new Map();
  let failedInsertions: any[] = [];
  let errors: any[] = [];

  const insertAndStoreRefs = (repo: Repository<any>, hash: Map<string, string>) => async (selection: any[]) => {
    const { identifiers } = await repo.insert(selection);
    selection.forEach((r, i) => hash.set(r.identificationNumber, identifiers[i].id));
    logger.info(`Inserted ${selection.length} records`);
  };

  // eslint-disable-next-line no-restricted-syntax
  for await (const dbRings of getEntityRecords('Ringby', 'RN')) {
    let mapped: any[] = [];
    try {
      mapped = ringMapper(dbRings);
      await insertAndStoreRefs(repository, idsHash)(mapped);
    } catch {
      // all batch fails
      failedInsertions = failedInsertions.concat(mapped);
    }
  }

  if (failedInsertions.length) {
    logger.info(`Failed rings batches passed to funnelProcessor (totally ${failedInsertions.length} records)`);
    errors = await funnelProcessor([100, 10, 1], failedInsertions, insertAndStoreRefs(repository, idsHash));
  }

  if (errors.length) {
    logger.error(`There are some final errors on insertion rings:\n${errors.join('\n')}`);
  } else {
    logger.info(`Finally all rings was inserted successfully`);
  }

  return idsHash;
}
