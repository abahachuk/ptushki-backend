import path from 'path';
import { Builder, fixturesIterator, Loader, Parser, Resolver } from 'typeorm-fixtures-cli/dist';
import { createConnection, getRepository } from 'typeorm';
import config from './prepare-db-config';

const load = async () => {
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

  await connection.close();
};

load()
  .then(() => {
    console.log('fixtures loaded');
  })
  .catch(console.error);
