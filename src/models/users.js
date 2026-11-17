
import bcrypt from 'bcrypt';
import User from './schemas/users.js';

const createUser = async ({ name, username, email, password, role }) => {
    const normalizedName = name?.trim();
    const normalizedUsername = username?.toLowerCase().trim();
    const normalizedEmail = email?.toLowerCase().trim();

    const passwordHash = await bcrypt.hash(password, 12);

    return User.create({
        name: normalizedName,
        username: normalizedUsername,
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

const findUserByUsername = async (username) => {
    return User.findOne({
        username: username.toLowerCase().trim(),
    }).populate('role');
};

const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

export {
    createUser,
    findUserByEmail,
    findUserByUsername,
    verifyPassword,
};
