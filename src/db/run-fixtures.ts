import 'dotenv/config';
import path from 'path';
import { Builder, fixturesIterator, IFixture, Loader, Parser, Resolver } from 'typeorm-fixtures-cli/dist';
import { Connection, createConnection, DeepPartial } from 'typeorm';
import config from './prepare-db-config';
import { executeInThreadedQueue } from '../utils/async-queue';
import { countedProgress, dotProgress } from '../utils/clean-write-line';

const load = async (connection: Connection): Promise<{ [index: string]: number }> => {
  const loader = new Loader();
  loader.load(path.resolve(process.cwd(), 'src/fixtures'));

  const resolver = new Resolver();
  const fixtures = resolver.resolve(loader.fixtureConfigs);
  const builder = new Builder(connection, new Parser());

  const fixturing = [...fixturesIterator(fixtures)].map((f: IFixture, i: number, arr: IFixture[]) => async () => {
    const entity: unknown = await builder.build(f);
    // @ts-ignore
    await connection.getRepository(entity.constructor.name).insert(entity as DeepPartial<any>);
    countedProgress(i, arr.length, 'fixtures loaded:');
  });

  await executeInThreadedQueue(fixturing, 5);

  const result = fixtures.reduce((acc: any, { entity }: { entity: string }) => {
    acc[entity] = acc[entity] ? (acc[entity] += 1) : 1;
    return acc;
  }, {});

  await connection.close();
  return result;
};

let connection: Connection | undefined;

(async () => {
  try {
    const progress1 = dotProgress('connect to db');
    console.time('taken time');
    connection = await createConnection(config);
    progress1.stop();
    console.log('db connected');
    const progress2 = dotProgress('drop and sync db');
    // README this drops db and recreate scheme
    await connection.synchronize(true);
    progress2.stop();
    console.log('db dropped and synced');
    const result = await load(connection);
    console.log('loaded fixtures:\n', result, '\n');
    console.timeEnd('taken time');
  } catch (e) {
    if (connection) {
      await connection.close();
    }
    console.error(e);
    process.exit(1);
  }
})();
