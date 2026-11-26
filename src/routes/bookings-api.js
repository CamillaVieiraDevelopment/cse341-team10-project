import { Router } from 'express';
import {
    getAllBookings,
    updateBookingHandler,
    deleteBookingHandler,
} from '../controllers/bookings.js';
import { requireApiLogin } from '../middleware/auth.js';

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
 *         userId:
 *           type: string
 *           description: Id of the user who made the booking.
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
 * /api/bookings:
 *   get:
 *     summary: Retrieve bookings
 *     description: Admins receive every booking, newest first. Other signed-in users receive only the bookings where one of the passengers has their email.
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
 *       401:
 *         description: Authentication required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Authentication required.
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
router.get('/', requireApiLogin, getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Update a booking
 *     description: Updates the ticket class, day, and passengers of a booking. Admins can update any booking. Other users can update only bookings where they are a passenger.
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Confirmation code of the booking.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketClass
 *               - selectedDay
 *               - passengers
 *             properties:
 *               ticketClass:
 *                 type: string
 *               selectedDay:
 *                 type: string
 *                 example: monday
 *               passengers:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 8
 *                 items:
 *                   type: object
 *                   required:
 *                     - firstName
 *                     - lastName
 *                     - email
 *                     - phone
 *                   properties:
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *     responses:
 *       200:
 *         description: The updated booking.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Missing or invalid booking fields.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: The signed-in user is not an admin or a passenger on this booking.
 *       404:
 *         description: Booking not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:id', requireApiLogin, updateBookingHandler);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     description: Admins can delete any booking. Other users can delete only bookings where they are a passenger.
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Confirmation code of the booking.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Booking deleted.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: The signed-in user is not an admin or a passenger on this booking.
 *       404:
 *         description: Booking not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id', requireApiLogin, deleteBookingHandler);

export default router;