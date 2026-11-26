import { Router } from 'express';

import {
    getTripsListPage,
    getTripDetailsPage,
} from '../controllers/trips.js';

import {
    bookingPage,
    processBookingRequest,
    bookingConfirmationPage,
} from '../controllers/bookings.js';

import { requirePageLogin } from '../middleware/auth.js';

const router = Router();

// Public trip pages
router.get('/', getTripsListPage);
router.get('/:tripId', getTripDetailsPage);

// Protected booking pages
router.get('/booking/:scheduleId', requirePageLogin, bookingPage);
router.post('/book', requirePageLogin, processBookingRequest);
router.get(
    '/confirmation/:confirmationId',
    requirePageLogin,
    bookingConfirmationPage
);

export default router;
