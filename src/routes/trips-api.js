
import { Router } from 'express';
import {
    getAllTripsHandler,
    getTripByIdHandler,
} from '../controllers/trips.js';

const router = Router();

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Retrieve all trips
 *     description: Returns a list of all available train trips.
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: A list of trips retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       500:
 *         description: Internal server error.
 */
router.get('/', getAllTripsHandler);

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
