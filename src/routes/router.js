
import { Router } from 'express';
import apiRoutes from './api-routes.js';
import ejsRoutes from './ejs-routes.js';

const router = Router();

// API routes
router.use('/api', apiRoutes);

// EJS routes
router.use('/', ejsRoutes);

export default router;
