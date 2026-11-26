import { pathToFileURL } from 'url';
import { connectMongoose, closeMongoose } from './mongoose.js';
import User from '../models/schemas/users.js';
import Role from '../models/schemas/roles.js';

const promoteAdmin = async (email) => {
    if (!email) {
        throw new Error('ADMIN_EMAIL environment variable is required.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const adminRole = await Role.findOne({ name: 'admin' });

    if (!adminRole) {
        throw new Error('Admin role not found. Run the role seed first.');
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new Error('User not found. Register the account first.');
    }

    user.role = adminRole._id;
    await user.save();

    console.log('User successfully promoted to admin.');
};

const run = async () => {
    try {
        await connectMongoose();
        await promoteAdmin(process.env.ADMIN_EMAIL);
    } catch (error) {
        console.error('Error promoting user:', error.message);
        process.exitCode = 1;
    } finally {
        await closeMongoose();
    }
};

if (
    process.argv[1] &&
    pathToFileURL(process.argv[1]).href === import.meta.url
) {
    await run();
}

export { promoteAdmin };
