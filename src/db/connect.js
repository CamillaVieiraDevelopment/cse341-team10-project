
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

let database;
let client;

const connectToDb = async (options = {}) => {
  if (database) {
    return database;
  }

  const connectionString =
    options.connectionString || process.env.MONGODB_URI;

  const databaseName =
    options.databaseName || process.env.MONGODB_DB_NAME || 'practice';

  if (!connectionString) {
    throw new Error('MONGODB_URI is required.');
  }

  // Connect to MongoDB using the native driver.
  client = new MongoClient(connectionString);
  await client.connect();

  // Connect Mongoose to the same MongoDB database.
  await mongoose.connect(connectionString, {
    dbName: databaseName,
  });

  console.log(
    'Mongoose connection state:',
    mongoose.connection.readyState
  );

  database = client.db(databaseName);
  console.log('Connected database:', database.databaseName);

  return database;
};

const getDb = () => {
  if (!database) {
    throw new Error('Database not initialized. Call connectToDb first.');
  }

  return database;
};

const closeDb = async () => {
  if (client) {
    await client.close();
    client = undefined;
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  database = undefined;
};

export { closeDb, connectToDb, getDb };
