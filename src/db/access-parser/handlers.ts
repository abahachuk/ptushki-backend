import { getRepository, Repository } from 'typeorm';
import { EuringAccessTable, EURINGs, mapEURINGCode } from './euring-access-tables';
import { entitySelectAll, getEntityRecords } from './access-entity-methods';
import { Person } from '../../entities/person-entity';
import { Ring } from '../../entities/ring-entity';
import { Observation } from '../../entities/observation-entity';
import { logger } from '../../utils/logger';
import { personMapper } from './persons-access-table';
import { ringMapper } from './rings-access-table';
import { observationMapper } from './observation-access-table';

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

export async function uploadPersons(table: string): Promise<Map<string, string>> {
  const idsHash: Map<string, string> = new Map();
  const repository: Repository<Person> = getRepository(Person);
  const instances = await entitySelectAll(table);
  const mapped = personMapper(instances);
  const { identifiers } = await repository.insert(mapped);
  logger.info(`${instances.length} persons inserted`);
  mapped.forEach((r, i) => idsHash.set(r.name.toLowerCase(), identifiers[i].id));
  return idsHash;
}

export async function uploadRings(
  table: string,
  id: string,
  personsHash: Map<string, string>,
): Promise<Map<string, string>> {
  const repository: Repository<Ring> = getRepository(Ring);
  const idsHash: Map<string, string> = new Map();
  let failedInsertions: any[] = [];
  let errors: any[] = [];

  const insertAndStoreRefs = (repo: Repository<any>, hash: Map<string, string>) => async (selection: Ring[]) => {
    // @ts-ignore
    const { identifiers } = await repo.insert(selection);
    selection.forEach((r: Ring, i: number) => hash.set(r.identificationNumber, identifiers[i].id));
    logger.info(`Inserted ${selection.length} records`);
  };

  // eslint-disable-next-line no-restricted-syntax
  for await (const dbRings of getEntityRecords(table, id)) {
    let mapped: Ring[] = [];
    try {
      mapped = ringMapper(dbRings, personsHash);
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
    logger.error(`There are some final errors on rings insertion:\n${errors.join('\n')}`);
  } else {
    logger.info(`Finally all rings were inserted successfully`);
  }

  return idsHash;
}

export async function uploadObservations(
  table: string,
  id: string,
  personsHash: Map<string, string>,
  ringsHash: Map<string, string>,
): Promise<void> {
  const repository: Repository<Observation> = getRepository(Observation);
  let failedInsertions: any[] = [];
  let errors: any[] = [];

  const insert = (repo: Repository<Observation>) => async (selection: Observation[]) => {
    await repo.insert(selection);
    logger.info(`Inserted ${selection.length} records`);
  };

  // eslint-disable-next-line no-restricted-syntax
  for await (const dbRings of getEntityRecords(table, id)) {
    let mapped: Observation[] = [];
    try {
      mapped = observationMapper(dbRings, personsHash, ringsHash);
      await insert(repository)(mapped);
    } catch {
      // all batch fails
      failedInsertions = failedInsertions.concat(mapped);
    }
  }

  if (failedInsertions.length) {
    logger.info(`Failed observations batches passed to funnelProcessor (totally ${failedInsertions.length} records)`);
    errors = await funnelProcessor([100, 10, 1], failedInsertions, insert(repository));
  }

  if (errors.length) {
    logger.error(`There are some final errors on observations insertion:\n${errors.join('\n')}`);
  } else {
    logger.info(`Finally all observations were inserted successfully`);
  }
}
