
import {
    getTripsListPage,
    getTripDetailsPage,
} from '../controllers/trips.js';

import {
    bookingPage,
    processBookingRequest,
} from './book.js';

import confirmationPage from './confirm.js';
import { Router } from 'express';
import { requirePageLogin } from '../middleware/auth.js';

const router = Router();

router.get('/', getTripsListPage);
router.get('/:tripId', getTripDetailsPage);

// Booking requires an authenticated user.
router.get(
    '/booking/:scheduleId',
    requirePageLogin,
    bookingPage
);

router.post(
    '/book',
    requirePageLogin,
    processBookingRequest
);

// Confirmation requires authentication and ownership validation.
router.get(
    '/confirmation/:confirmationId',
    requirePageLogin,
    confirmationPage
);

export default router;
