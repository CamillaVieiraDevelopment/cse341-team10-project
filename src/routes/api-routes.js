import { Router } from 'express';
import { trainsApi } from './trains.js';
import tripsApiRouter from './trips-api.js';
import bookingsApiRouter from './bookings-api.js';

const router = Router();

// Trains API
router.get('/trains', trainsApi);

// Trips API
router.use('/trips', tripsApiRouter);

// Bookings API
router.use('/bookings', bookingsApiRouter);

export default router;
