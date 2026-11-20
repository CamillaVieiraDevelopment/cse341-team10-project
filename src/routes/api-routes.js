import { Router } from 'express';
import { trainsApi } from './trains.js';
import tripsApiRouter from './trips-api.js';

const router = Router();

// Trains API
router.get('/trains', trainsApi);

// Trips API
router.use('/trips', tripsApiRouter);

export default router;