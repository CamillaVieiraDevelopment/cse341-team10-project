
import mongoose from 'mongoose';
import dns from 'node:dns';

// Configure DNS for all MongoDB scripts and application connections.
dns.setServers(['8.8.8.8', '8.8.4.4']);

let isConnected = false;

const connectMongoose = async (options = {}) => {
    if (isConnected) {
        return mongoose.connection;
    }

    const connectionString =
        options.connectionString || process.env.MONGODB_URI;

    const databaseName =
        options.databaseName || process.env.MONGODB_DB_NAME || 'practice';

    if (!connectionString) {
        throw new Error('MONGODB_URI is required.');
    }

    await mongoose.connect(connectionString, {
        dbName: databaseName,
    });

    isConnected = true;

    console.log('Mongoose connected to MongoDB.');

    return mongoose.connection;
};

const closeMongoose = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    isConnected = false;
};

export { connectMongoose, closeMongoose };
