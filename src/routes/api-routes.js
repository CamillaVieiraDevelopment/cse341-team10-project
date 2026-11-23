
import express from "express";

import {
  getAllStations,
  getStationById,
} from "../controllers/stations.js";

const router = express.Router();

/**
 * @openapi
 * /api/stations: 
 *   get:
 *     summary: Get all stations
 *     tags:
 *       - Stations
 *     responses:
 *       200:
 *         description: A list of all stations
 *       500:
 *         description: Server error
 */
router.get("/", getAllStations);

/**
 * @openapi
 * /api/stations/{id}:
 *   get:
 *     summary: Get a station by ID
 *     tags:
 *       - Stations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The station ID
 *     responses:
 *       200:
 *         description: Station found
 *       404:
 *         description: Station not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getStationById);

export default router;
