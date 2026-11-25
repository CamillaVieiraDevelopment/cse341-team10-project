
import { Router } from 'express';
import {
    getAllTicketClasses,
    getTicketClassesForDay
} from '../controllers/ticket-classes.js';

import { trainsApi } from './trains.js';
import tripsApiRouter from './trips-api.js';
import bookingsApiRouter from './bookings-api.js';

const router = Router();

/**
 * @swagger
 * /api/ticket-classes:
 *   get:
 *     summary: Get ticket classes
 *     description: Retrieve all ticket classes or filter them by availability day.
 *     tags: [Ticket Classes]
 *     parameters:
 *       - in: query
 *         name: day
 *         required: false
 *         schema:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *         description: Optional day of the week to filter available ticket classes.
 *     responses:
 *       200:
 *         description: List of ticket classes, optionally filtered by day.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TicketClass'
 *       400:
 *         description: Missing or invalid day
 *       500:
 *         description: Failed to fetch ticket classes
 */
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
