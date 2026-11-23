
import {
    getTripsListPage,
    getTripDetailsPage,
} from '../controllers/trips.js';

import {
    bookingPage,
    processBookingRequest,
    bookingConfirmationPage,
} from '../controllers/bookings.js';
import { Router } from 'express';


const router = Router();

// List all trips
router.get('/', getTripsListPage);

// Trip details page
router.get('/:tripId', getTripDetailsPage);

// Book ticket
router.get('/booking/:scheduleId', bookingPage);
router.post('/book', processBookingRequest);

// Booking confirmation page
router.get('/confirmation/:confirmationId', bookingConfirmationPage);

export default router;
