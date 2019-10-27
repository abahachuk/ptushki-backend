import { getRepository, Repository } from 'typeorm';
import { EuringAccessTable, EURINGs, mapEURINGCode } from './euring-access-tables';
import { entitySelectAll } from './access-entity-methods';
import { Ring } from '../../entities/ring-entity';
import { logger } from '../../utils/logger';

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

// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
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

export async function uploadRings(rings: Ring[]): Promise<void> {
  try {
    const repository: Repository<Ring> = getRepository(Ring);
    await repository.insert(rings);
  } catch (e) {
    logger.warn(
      `Failed when tried to insert rings: [ ${rings
        .map(r => r.identificationNumber)
        .slice(0, 5)
        .join(', ')} ... ]`,
    );
    logger.error(`[${e.name}] ${e.message}: ${e.detail}`);
  }
}
