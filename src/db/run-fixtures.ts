import path from 'path';
import { Builder, fixturesIterator, IFixture, Loader, Parser, Resolver } from 'typeorm-fixtures-cli/dist';
import { Connection, createConnection } from 'typeorm';
import config from './prepare-db-config';
import { executeInThreadedQueue } from '../utils/async-queue';

const load = async (connection: Connection): Promise<{ [index: string]: number }> => {
  const loader = new Loader();
  loader.load(path.resolve(process.cwd(), 'src/fixtures'));

  const resolver = new Resolver();
  const fixtures = resolver.resolve(loader.fixtureConfigs);
  const builder = new Builder(connection, new Parser());

  const fixturing = [...fixturesIterator(fixtures)].map((f: IFixture) => async () => {
    const entity = await builder.build(f);
    await connection.getRepository(entity.constructor.name).save(entity);
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
    console.time('taken time');
    connection = await createConnection(config);
    // README this drops db and recreate scheme
    await connection.synchronize(true);
    const result = await load(connection);
    console.log('loaded fixtures: ', result);
    console.timeEnd('taken time');
  } catch (e) {
    if (connection) {
      await connection.close();
    }
    console.error(e);
    process.exit(1);
  }
})();
