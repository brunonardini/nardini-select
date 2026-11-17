import {
  createDatabase,
  databaseName,
  readRoleSections,
  requiredEnv,
  roleSql,
  withClient,
  withDatabase,
} from './sql.ts';

const sections = readRoleSections();
const provisionUrl = requiredEnv('PROVISION_URL');
const passwords = {
  APP_MIGRATOR_PASSWORD: requiredEnv('APP_MIGRATOR_PASSWORD'),
  APP_RUNTIME_PASSWORD: requiredEnv('APP_RUNTIME_PASSWORD'),
  AUDIT_MAINTAINER_PASSWORD: requiredEnv('AUDIT_MAINTAINER_PASSWORD'),
};
const createDatabases = process.env.PROVISION_CREATE_DATABASES === '1';

await withClient(provisionUrl, async (client) => {
  await client.query(roleSql(sections, passwords));
  if (createDatabases) {
    await createDatabase(client, 'nardini_dev');
    await createDatabase(client, 'nardini_test');
  }
});

const targets = createDatabases
  ? ['nardini_dev', 'nardini_test']
  : [databaseName(provisionUrl)];

for (const target of targets) {
  await withClient(withDatabase(provisionUrl, target), async (client) => {
    await client.query(sections['database-grants']);
    await client.query(sections['schema-grants']);
  });
}

console.log(`Provisioned ${targets.join(', ')}.`);
