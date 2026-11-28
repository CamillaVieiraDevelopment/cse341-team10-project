import { Router } from 'express';
import {
    getAllBookings,
    getMyBookings,
} from '../controllers/bookings.js';
import {
    requireApiLogin,
    requireApiRole,
} from '../middleware/auth.js';
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - id
 *         - scheduleId
 *         - tripId
 *         - ticketClass
 *         - selectedDay
 *         - passengers
 *       properties:
 *         id:
 *           type: string
 *           description: Unique confirmation code for the booking.
 *         scheduleId:
 *           type: integer
 *           description: Id of the schedule that was booked.
 *           example: 1
 *         tripId:
 *           type: string
 *           description: Id of the trip that was booked.
 *           example: alpine-panorama
 *         ticketClass:
 *           type: string
 *           description: Code of the ticket class that was selected.
 *         selectedDay:
 *           type: string
 *           description: Day of the week that was selected.
 *           example: monday
 *         passengers:
 *           type: array
 *           minItems: 1
 *           maxItems: 8
 *           items:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               email:
 *                 type: string
 *                 example: jane.smith@example.com
 *               phone:
 *                 type: string
 *                 example: '+1 555-0100'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 */

/**
 * @swagger
 * /api/bookings/mine:
 *   get:
 *     summary: Retrieve bookings associated with the logged-in user
 *     description: Returns bookings where the authenticated user's email matches a passenger's email.
 *     tags: [Bookings]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       500:
 *         description: Internal server error.
 */
router.get('/mine', requireApiLogin, getMyBookings);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Retrieve all bookings
 *     description: Returns every booking, newest first, including passenger details.
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: A list of bookings retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while retrieving bookings.
 */
router.get('/', requireApiRole('admin'), getAllBookings);

export default router;
