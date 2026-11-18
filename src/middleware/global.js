
import { loadSessionUser } from './auth.js';

const setLocalVariables = (req, res, next) => {
    res.locals.NODE_ENV =
        process.env.NODE_ENV?.toLowerCase() || 'production';

    res.locals.query = req.query;

    next();
};

const globalMiddleware = [
    loadSessionUser,
    setLocalVariables,
];

export default globalMiddleware;
