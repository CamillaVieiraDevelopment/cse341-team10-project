
import Role from '../models/schemas/roles.js';
import {
    createUser,
    findUserByEmail,
    verifyPassword,
} from '../models/users.js';

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).render('register', {
                title: 'Create Account | Kizuna Rail',
                error: 'All fields are required.',
            });
        }

        if (password.length < 8) {
            return res.status(400).render('register', {
                title: 'Create Account | Kizuna Rail',
                error: 'Password must contain at least 8 characters.',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await findUserByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).render('register', {
                title: 'Create Account | Kizuna Rail',
                error: 'An account with this email already exists.',
            });
        }

        const customerRole = await Role.findOne({
            name: 'customer',
        });

        if (!customerRole) {
            return res.status(500).render('register', {
                title: 'Create Account | Kizuna Rail',
                error: 'Registration is temporarily unavailable.',
            });
        }

        await createUser({
            name,
            email: normalizedEmail,
            password,
            role: customerRole._id,
        });

        return res.redirect('/login?registered=true');
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).render('register', {
                title: 'Create Account | Kizuna Rail',
                error: 'An account with this email already exists.',
            });
        }

        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).render('login', {
                title: 'Login | Kizuna Rail',
                error: 'Email and password are required.',
                message: null,
            });
        }

        const user = await findUserByEmail(email);

        if (!user || !await verifyPassword(password, user.passwordHash)) {
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
