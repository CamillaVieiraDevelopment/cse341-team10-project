
import Role from '../models/schemas/roles.js';
import {
    createUser,
    findUserByEmail,
    findUserByUsername,
    verifyPassword,
} from '../models/users.js';

const getFormData = (body = {}) => ({
    name: typeof body.name === 'string' ? body.name.trim() : '',
    username: typeof body.username === 'string'
        ? body.username.trim()
        : '',
    email: typeof body.email === 'string' ? body.email.trim() : '',
});

const renderRegistrationError = (res, status, error, formData) => {
    return res.status(status).render('register', {
        title: 'Create Account | Kizuna Rail',
        error,
        formData,
    });
};

const register = async (req, res, next) => {
    try {
        const body = req.body || {};
        const { password } = body;
        const formData = getFormData(body);

        if (
            !formData.name ||
            !formData.username ||
            !formData.email ||
            typeof password !== 'string' ||
            !password
        ) {
            return renderRegistrationError(
                res,
                400,
                'All fields are required.',
                formData
            );
        }

        const normalizedUsername = formData.username.toLowerCase();
        const normalizedEmail = formData.email.toLowerCase();

        if (
            normalizedUsername.length < 3 ||
            normalizedUsername.length > 30 ||
            !/^[a-z0-9_]+$/.test(normalizedUsername)
        ) {
            return renderRegistrationError(
                res,
                400,
                'Username must contain 3 to 30 characters and use only letters, numbers, or underscores.',
                formData
            );
        }

        if (password.length < 8) {
            return renderRegistrationError(
                res,
                400,
                'Password must contain at least 8 characters.',
                formData
            );
        }

        const existingEmail = await findUserByEmail(normalizedEmail);

        if (existingEmail) {
            return renderRegistrationError(
                res,
                409,
                'An account with this email already exists.',
                formData
            );
        }

        const existingUsername = await findUserByUsername(
            normalizedUsername
        );

        if (existingUsername) {
            return renderRegistrationError(
                res,
                409,
                'This username is already taken.',
                formData
            );
        }

        const customerRole = await Role.findOne({
            name: 'customer',
        });

        if (!customerRole) {
            return renderRegistrationError(
                res,
                500,
                'Registration is temporarily unavailable.',
                formData
            );
        }

        await createUser({
            name: formData.name,
            username: normalizedUsername,
            email: normalizedEmail,
            password,
            role: customerRole._id,
        });

        return res.redirect('/login?registered=true');
    } catch (error) {
        if (error.code === 11000) {
            const duplicateUsername =
                error.keyPattern?.username ||
                error.keyValue?.username;

            const message = duplicateUsername
                ? 'This username is already taken.'
                : 'An account with this email already exists.';

            return renderRegistrationError(
                res,
                409,
                message,
                getFormData(req.body)
            );
        }

        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const body = req.body || {};
        const { email, password } = body;

        if (
            typeof email !== 'string' ||
            !email.trim() ||
            typeof password !== 'string' ||
            !password
        ) {
            return res.status(400).render('login', {
                title: 'Login | Kizuna Rail',
                error: 'Email and password are required.',
                message: null,
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await findUserByEmail(normalizedEmail);

        if (
            !user ||
            !await verifyPassword(password, user.passwordHash)
        ) {
            return res.status(401).render('login', {
                title: 'Login | Kizuna Rail',
                error: 'Invalid email or password.',
                message: null,
            });
        }

        if (!user.role) {
            return res.status(403).render('login', {
                title: 'Login | Kizuna Rail',
                error: 'Your account does not have a valid role.',
                message: null,
            });
        }

        await new Promise((resolve, reject) => {
            req.session.regenerate((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        req.session.user = {
            id: user._id.toString(),
            name: user.name,
            role: user.role.name,
        };

        await new Promise((resolve, reject) => {
            req.session.save((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        return res.redirect('/');
    } catch (error) {
        return next(error);
    }
};

const logout = (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            return next(error);
        }

        res.clearCookie('connect.sid');
        return res.redirect('/login?loggedOut=true');
    });
};

export {
    register,
    login,
    logout,
};
