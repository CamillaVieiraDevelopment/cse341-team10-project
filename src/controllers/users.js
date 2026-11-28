
import { getAllUsers } from '../models/users.js';

const usersAdminPage = async (req, res, next) => {
    try {
        const users = await getAllUsers();

        return res.render('users', {
            title: 'User Administration',
            users,
        });
    } catch (error) {
        return next(error);
    }
};

export {
    usersAdminPage,
};
