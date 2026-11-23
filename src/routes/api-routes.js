import { Router } from 'express';
import {
    getAllTicketClasses,
    getTicketClassesForDay
} from '../controllers/ticket-classes.js';

import { trainsApi } from './trains.js';
import tripsApiRouter from './trips-api.js';
import bookingsApiRouter from './bookings-api.js';

const router = Router();

// Ticket Classes API
router.get('/ticket-classes', (req, res) => {
    if (req.query.day !== undefined) {
        return getTicketClassesForDay(req, res);
    }

    return getAllTicketClasses(req, res);
});

// Trains API
router.get('/trains', trainsApi);

// Trips API
router.use('/trips', tripsApiRouter);

// Bookings API
router.use('/bookings', bookingsApiRouter);

export default router;