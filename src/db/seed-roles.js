
import { pathToFileURL } from 'url';
import { connectMongoose, closeMongoose } from './mongoose.js';
import Role from '../models/schemas/roles.js';

const roles = ['customer', 'admin'];

const seedRoles = async () => {
    for (const name of roles) {
        await Role.updateOne(
            { name },
            { $setOnInsert: { name } },
            { upsert: true }
        );
    }

    return Role.find({ name: { $in: roles } });
};

const runSeedRoles = async () => {
    try {
        await connectMongoose();
        await seedRoles();

        console.log('Roles initialized successfully.');
    } catch (error) {
        console.error('Error initializing roles:', error);
        process.exitCode = 1;
    } finally {
        await closeMongoose();
    }
};

if (
    process.argv[1] &&
    pathToFileURL(process.argv[1]).href === import.meta.url
) {
    await runSeedRoles();
}

export { seedRoles };
