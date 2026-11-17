
process.env.SESSION_SECRET = 'kizuna-rail-vitest-only-secret';

import { afterAll, beforeAll, beforeEach, inject } from 'vitest';
import { closeDb, connectToDb, getDb } from '../src/db/connect.js';
import { closeMongoose, connectMongoose } from '../src/db/mongoose.js';
import { initializeDatabase } from '../src/db/initialize.js';
import { seedRoles } from '../src/db/seed-roles.js';
import User from '../src/models/schemas/users.js';
import Role from '../src/models/schemas/roles.js';

const connectionString = inject('MONGODB_TEST_URI');

beforeAll(async () => {
  const databaseName = 'kizuna-rail-test';

  await connectToDb({
    connectionString,
    databaseName,
  });

  await connectMongoose({
    connectionString,
    databaseName,
  });
});

beforeEach(async () => {
  const db = getDb();

  await db.dropDatabase();
  await initializeDatabase(db);

  // Recreate schema indexes after dropping the test database.
  await Promise.all([
    User.createIndexes(),
    Role.createIndexes(),
  ]);

  await seedRoles();
});

afterAll(async () => {
  await closeMongoose();
  await closeDb();
});
