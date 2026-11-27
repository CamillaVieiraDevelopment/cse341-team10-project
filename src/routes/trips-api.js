
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
 *     summary: Retrieve trips with pagination, search, and filters
 *     description: Returns a paginated list of train trips, with optional filtering by region and season and keyword search across trip names and descriptions.
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
 *       - in: query
 *         name: region
 *         required: false
 *         description: Filter trips by region.
 *         schema:
 *           type: string
 *           maxLength: 50
 *       - in: query
 *         name: season
 *         required: false
 *         description: Filter trips by best season.
 *         schema:
 *           type: string
 *           maxLength: 50
 *       - in: query
 *         name: search
 *         required: false
 *         description: Search keywords in trip names and descriptions (case-insensitive).
 *         schema:
 *           type: string
 *           maxLength: 100
 *     responses:
 *       200:
 *         description: Filtered and paginated list of trips retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trips:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trip'
 *                 filters:
 *                   type: object
 *                   properties:
 *                     region:
 *                       type: string
 *                       nullable: true
 *                     season:
 *                       type: string
 *                       nullable: true
 *                     search:
 *                       type: string
 *                 availableFilters:
 *                   type: object
 *                   properties:
 *                     regions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     seasons:
 *                       type: array
 *                       items:
 *                         type: string
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
 *                       example: 2
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid pagination, filter, or search parameters.
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
