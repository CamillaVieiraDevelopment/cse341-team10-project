
import { connectMongoose, closeMongoose } from './mongoose.js';
import Role from '../models/schemas/roles.js';

const roles = ['customer', 'admin'];

try {
    await connectMongoose();

    for (const name of roles) {
        await Role.updateOne(
            { name },
            { $setOnInsert: { name } },
            { upsert: true }
        );
    }

    console.log('Roles initialized successfully.');
} catch (error) {
    console.error('Error initializing roles:', error);
    process.exitCode = 1;
} finally {
    await closeMongoose();
}
