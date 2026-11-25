import { Router } from 'express';
import apiRoutes from './api-routes.js';
import ejsRoutes from './ejs-routes.js';
import authRoutes from './auth.js';

const router = Router();

// API routes
router.use('/api', apiRoutes);

// Authentication routes
router.use('/', authRoutes);

// EJS routes
router.use('/', ejsRoutes);

export default router;
