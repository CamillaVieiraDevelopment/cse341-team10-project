
import { Router } from 'express';
import { homePage, aboutPage, testErrorPage } from './index.js';
import { trainsPage } from './trains.js';
import railTripsRouter from './trips.js';
import { bookingsAdminPage } from '../controllers/bookings.js';
import { requirePageLogin, requirePageRole } from '../middleware/auth.js';

const router = Router();

// Home page
router.get('/', homePage);

// Protected admin dashboard
router.get(
    '/admin',
    requirePageRole('admin'),
    (req, res) => {
        return res.render('admin-dashboard', {
            title: 'Admin Dashboard',
        });
    }
);

// About page
router.get('/about', aboutPage);

// Trains page
router.get('/trains', trainsPage);

// Trips pages
router.use('/trips', railTripsRouter);

// Bookings admin page
router.get(
    '/bookings-admin',
    requirePageLogin,
    bookingsAdminPage
);

// Test 500 error page
router.get('/500', testErrorPage);

export default router;
