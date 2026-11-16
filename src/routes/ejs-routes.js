
import { Router } from 'express';
import {
    homePage,
    aboutPage,
    testErrorPage,
    registerPage,
} from './index.js';
import { trainsPage } from './trains.js';
import railTripsRouter from './trips.js';

const router = Router();

router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/trains', trainsPage);

router.use('/trips', railTripsRouter);

router.get('/login', (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }

    const message = req.query.registered
        ? 'Account created successfully. Please log in.'
        : req.query.loggedOut
            ? 'You have been logged out.'
            : null;

    return res.render('login', {
        title: 'Login | Kizuna Rail',
        error: null,
        message,
    });
});

router.get('/register', (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }

    return registerPage(req, res);
});

router.get('/500', testErrorPage);

export default router;
