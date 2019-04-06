import path from 'path';
import { Builder, fixturesIterator, Loader, Parser, Resolver } from 'typeorm-fixtures-cli/dist';
import { createConnection, getRepository } from 'typeorm';
import config from './prepare-db-config';

const load = async (): Promise<{ [index: string]: number }> => {
  const loader = new Loader();
  loader.load(path.resolve(process.cwd(), 'src/fixtures'));

  const resolver = new Resolver();
  const connection = await createConnection(config);

  await connection.synchronize(true);
  const fixtures = resolver.resolve(loader.fixtureConfigs);
  const builder = new Builder(connection, new Parser());

  /* eslint-disable no-restricted-syntax,no-await-in-loop */
  for (const fixture of fixturesIterator(fixtures)) {
    const entity = await builder.build(fixture);
    await getRepository(entity.constructor.name).save(entity);
  }
  /* eslint-enable */

  const result = fixtures.reduce((acc: any, { entity }: { entity: string }) => {
    acc[entity] = acc[entity] ? (acc[entity] += 1) : 1;
    return acc;
  }, {});

  await connection.close();
  return result;
};

load()
  .then(result => {
    console.log('fixtures was loaded: ', result);
  })
  .catch(console.error);
