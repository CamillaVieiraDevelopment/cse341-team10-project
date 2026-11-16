
import { Router } from 'express';
import {
    getAllTripsHandler,
    getTripByIdHandler,
    updateTripHandler,
    deleteTripHandler,
} from '../controllers/trips.js';
import { requireApiRole } from '../middleware/auth.js';

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

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Update a trip
 *     description: Updates an existing trip. Only administrators can perform this operation.
 *     tags: [Trips]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the trip.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update. Only supported trip properties are accepted.
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               region:
 *                 type: string
 *               startStation:
 *                 type: string
 *               endStation:
 *                 type: string
 *               duration:
 *                 type: string
 *               distance:
 *                 type: number
 *                 minimum: 0
 *               highlights:
 *                 type: array
 *                 items:
 *                   type: string
 *               bestSeason:
 *                 type: string
 *               operatingMonths:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 12
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trip updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trip:
 *                   $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Invalid trip data.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Administrator permission required.
 *       404:
 *         description: Trip not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/:id', requireApiRole('admin'), updateTripHandler);

/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Delete a trip
 *     description: Deletes a trip only if it has no associated schedules or confirmations. Only administrators can perform this operation.
 *     tags: [Trips]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique identifier of the trip.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip deleted successfully.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Administrator permission required.
 *       404:
 *         description: Trip not found.
 *       409:
 *         description: Trip has associated schedules or confirmations.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id', requireApiRole('admin'), deleteTripHandler);

export default router;
