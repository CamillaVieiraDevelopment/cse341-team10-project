
import { Router } from 'express';
import {
    getAllTripsHandler,
    getTripByIdHandler,
    getTripSchedulesHandler,
} from '../controllers/trips.js';

const router = Router();

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Retrieve trips with pagination
 *     description: Returns a paginated list of available train trips.
 *     tags: [Trips]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number (defaults to 1).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of trips per page (defaults to 10, maximum 50).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of trips retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trips:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trip'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalItems:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Invalid pagination parameters.
 *       500:
 *         description: Internal server error.
 */
router.get('/', getAllTripsHandler);

/**
 * @swagger
 * /api/trips/{id}/schedules:
 *   get:
 *     summary: Retrieve schedules for a specific trip
 *     description: Returns all active schedules for a specific train trip, ordered by departure time.
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the trip.
 *         schema:
 *           type: string
 *         example: sakura-valley
 *     responses:
 *       200:
 *         description: Active schedules retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Internal server error.
 */
router.get('/:id/schedules', getTripSchedulesHandler);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Retrieve a trip by ID
 *     description: Returns the details of a specific train trip.
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the trip.
 *         schema:
 *           type: string
 *         example: alpine-panorama
 *     responses:
 *       200:
 *         description: Trip retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       404:
 *         description: Trip not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', getTripByIdHandler);

export default router;
