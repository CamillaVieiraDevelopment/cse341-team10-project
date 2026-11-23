import railTripsRouter from './trips.js';
import stationsApi from "./api-routes.js";
import { trainsApi, trainsPage } from './trains.js';

import { Router } from 'express';
import apiRoutes from './api-routes.js';
import ejsRoutes from './ejs-routes.js';

const router = Router();

// Home page
router.get('/', homePage);

// About page
router.get('/about', aboutPage);

// Trains page
router.get('/trains', trainsPage);

// Trains API
router.get('/api/trains', trainsApi);

// Stations API
router.use("/api/stations", stationsApi);

// Rail trips
router.use('/trips', railTripsRouter);


// Test 500 error page
router.get('/500', testErrorPage);
// API routes
router.use('/api', apiRoutes);

// EJS routes
router.use('/', ejsRoutes);

export default router;
