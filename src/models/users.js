
import bcrypt from 'bcrypt';
import User from './schemas/users.js';

const createUser = async ({ name, email, password, role }) => {
    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 12);

    return User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
    });
};

const findUserByEmail = async (email) => {
    return User.findOne({
        email: email.toLowerCase().trim(),
    }).populate('role');
};

const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

export {
    createUser,
    findUserByEmail,
    verifyPassword,
};
